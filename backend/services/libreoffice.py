"""
Single rendering engine for the whole app.

One code path for Windows (local) and Linux (Render):
  - find_soffice() locates the LibreOffice binary on any OS.
  - every conversion runs headless with a private, per-call user profile so
    concurrent requests on the server don't fight over LibreOffice's profile
    lock (the classic "only one instance" hang).
  - PPTX -> PDF is done by LibreOffice; PDF -> JPG by PyMuPDF.

No PowerPoint COM, no separate local/prod branches.

Performance
-----------
A fresh `--headless` soffice process + a fresh profile directory is the safest
option for concurrency (no shared-profile lock contention), but it is also the
single biggest source of per-request latency here (process cold start + profile
bootstrap, a few seconds before any real conversion work happens).

Two levers reduce that cost, in order of effort:

  1. Render only the pages you actually show. `pdf_to_images` / `pptx_to_images`
     accept `max_pages`, so the preview path can rasterise just slide 1 instead
     of the whole deck. (Implemented here — used by generate_preview.)

  2. Stop paying the cold-start cost per request by running LibreOffice as a
     persistent listener (unoserver / `soffice --accept` socket) and converting
     through that. That's an infrastructure change, so it's flagged here rather
     than folded in silently.
"""

import logging
import os
import platform
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

import fitz  # PyMuPDF

logger = logging.getLogger("services.libreoffice")


class LibreOfficeError(RuntimeError):
    pass


def find_soffice() -> str:
    """Locate the LibreOffice executable on Windows, macOS, or Linux."""
    # 1) Explicit override (set this on Render if the binary is in an odd place)
    for var in ("SOFFICE_PATH", "LIBREOFFICE_PATH"):
        p = os.environ.get(var)
        if p and Path(p).exists():
            return p

    # 2) Anything already on PATH
    for name in ("soffice", "libreoffice", "soffice.exe", "soffice.bin"):
        found = shutil.which(name)
        if found:
            return found

    # 3) Well-known install locations
    system = platform.system()
    candidates = []
    if system == "Windows":
        candidates += [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
    elif system == "Darwin":
        candidates += ["/Applications/LibreOffice.app/Contents/MacOS/soffice"]
    else:  # Linux / Render
        candidates += [
            "/usr/bin/soffice",
            "/usr/bin/libreoffice",
            "/usr/lib/libreoffice/program/soffice",
            "/opt/libreoffice/program/soffice",
            "/snap/bin/libreoffice",
        ]

    for c in candidates:
        if Path(c).exists():
            return c

    raise LibreOfficeError(
        "LibreOffice (soffice) was not found. Install LibreOffice, add it to "
        "PATH, or set the SOFFICE_PATH environment variable. On Windows the "
        r"default is C:\Program Files\LibreOffice\program\soffice.exe."
    )


def _run_soffice(args, timeout: int = 180) -> subprocess.CompletedProcess:
    soffice = find_soffice()

    # A private profile per invocation. This is what fixes intermittent
    # failures/hangs when two conversions run at the same time on the server.
    profile_dir = Path(tempfile.gettempdir()) / f"lo_profile_{uuid.uuid4().hex}"

    cmd = [
        soffice,
        "--headless",
        "--invisible",
        "--nodefault",
        "--nologo",
        "--nofirststartwizard",
        "--norestore",
        "--nolockcheck",
        f"-env:UserInstallation={profile_dir.as_uri()}",
        *args,
    ]

    try:
        proc = subprocess.run(
            cmd,
            check=False,
            timeout=timeout,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except subprocess.TimeoutExpired as e:
        raise LibreOfficeError(f"LibreOffice timed out after {timeout}s.") from e
    finally:
        shutil.rmtree(profile_dir, ignore_errors=True)

    if proc.returncode != 0:
        raise LibreOfficeError(
            f"LibreOffice exited with code {proc.returncode}: "
            f"{proc.stderr.decode('utf-8', 'replace')[:800]}"
        )
    return proc


def pptx_to_pdf(pptx_path: str, output_dir: str) -> str:
    """Convert a PPTX to PDF and return the absolute PDF path."""
    os.makedirs(output_dir, exist_ok=True)
    _run_soffice(
        ["--convert-to", "pdf:impress_pdf_Export", "--outdir", output_dir, pptx_path]
    )
    pdf_path = os.path.join(
        output_dir, os.path.splitext(os.path.basename(pptx_path))[0] + ".pdf"
    )
    if not os.path.exists(pdf_path):
        raise LibreOfficeError("LibreOffice did not produce a PDF.")
    return pdf_path


def pdf_to_images(
    pdf_path: str,
    output_dir: str,
    dpi: int = 150,
    prefix: str = None,
    max_pages: int = None,
):
    """
    Rasterise PDF pages to JPGs. Returns a list of absolute paths.

    `max_pages` limits how many pages are rendered (e.g. 1 for a single-slide
    preview). None renders every page.
    """
    os.makedirs(output_dir, exist_ok=True)
    base = prefix or os.path.splitext(os.path.basename(pdf_path))[0]
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    doc = fitz.open(pdf_path)
    images = []
    try:
        page_count = len(doc)
        if max_pages is not None:
            page_count = min(page_count, max_pages)
        for i in range(page_count):
            pix = doc.load_page(i).get_pixmap(matrix=matrix)
            path = os.path.join(output_dir, f"{base}_slide{i + 1}.jpg")
            pix.save(path)
            images.append(path)
    finally:
        doc.close()
    return images


def pptx_to_images(pptx_path: str, output_dir: str, dpi: int = 150, max_pages: int = None):
    """PPTX -> PDF -> JPGs. Returns (pdf_path, [image_path, ...])."""
    pdf_path = pptx_to_pdf(pptx_path, output_dir)
    base = os.path.splitext(os.path.basename(pptx_path))[0]
    images = pdf_to_images(pdf_path, output_dir, dpi=dpi, prefix=base, max_pages=max_pages)
    return pdf_path, images


def warm_up():
    """
    Fire a trivial --version call at process startup so the OS page cache
    already has the soffice binary loaded before the first real request
    comes in. Shaves a noticeable chunk off the first conversion's latency.
    Never raises -- this is a best-effort optimization, not a correctness
    requirement.
    """
    try:
        soffice = find_soffice()
        subprocess.run([soffice, "--version"], timeout=30, capture_output=True)
        logger.info("LibreOffice warm-up complete (%s)", soffice)
    except Exception as e:
        logger.warning("LibreOffice warm-up skipped: %s", e)