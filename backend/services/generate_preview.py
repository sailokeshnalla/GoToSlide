"""
Generate a preview image for the modal and return Supabase URLs.

Flow: download template -> fill placeholders -> render slide 1 to JPG via
LibreOffice -> upload to Supabase -> return public URLs. No local paths leak
back to the frontend.

Two things keep this fast:

  * Only slide 1 is rendered/uploaded. The preview modal displays a single
    image, so rendering the whole deck was wasted work on multi-slide files.

  * The "base" preview -- the template with every placeholder blanked, which
    the modal requests once when it opens -- is deterministic per template, so
    we cache it under a content-addressed key and reuse it on later opens
    instead of re-rendering. (Only when the bucket is public, so the cached URL
    is stable.)
"""

import hashlib
import logging
import os
import shutil
import tempfile
import uuid

from pptx import Presentation

from services.libreoffice import pptx_to_images
from services.pptx_fill import fill_template
from services import supabase_storage
from services.supabase_storage import public_url, upload_files_parallel
from services.template_fetch import download_template

logger = logging.getLogger("services.generate_preview")

_PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


def _is_base_preview(replacements: dict) -> bool:
    """A base preview has no real content -- every value is blank/whitespace."""
    return not any((str(v).strip() if v is not None else "") for v in replacements.values())


def _base_cache_key(template_url: str) -> str:
    return hashlib.sha1(template_url.encode("utf-8")).hexdigest()


def generate_preview(template_url: str, replacements: dict, output_dir: str = None):
    replacements = replacements or {}

    # ── Fast path: reuse a previously rendered blank base preview ────────────
    is_base = _is_base_preview(replacements)
    cache_dir = None
    if is_base and supabase_storage.is_public_bucket():
        key = _base_cache_key(template_url)
        cache_dir = f"previews/base/{key}"
        slide_key = f"{cache_dir}/slide1.jpg"
        if supabase_storage.object_exists(slide_key):
            logger.info("Base preview cache hit for %s", key)
            slide_url = public_url(slide_key)
            return {
                "success": True,
                "pptx_url": public_url(f"{cache_dir}/template.pptx"),
                "preview_urls": [slide_url],
                "preview_url": slide_url,
            }

    work_dir = output_dir or tempfile.mkdtemp(prefix="preview_")
    owns_work_dir = output_dir is None
    try:
        if not template_url:
            raise ValueError("Template URL is missing")

        os.makedirs(work_dir, exist_ok=True)
        file_id = uuid.uuid4().hex

        in_path = os.path.join(work_dir, f"{file_id}_in.pptx")
        download_template(template_url, in_path)

        prs = Presentation(in_path)
        fill_template(prs, replacements, {})

        out_pptx = os.path.join(work_dir, f"{file_id}.pptx")
        prs.save(out_pptx)

        # Only slide 1 is shown in the modal -- render just that page.
        _pdf, image_paths = pptx_to_images(out_pptx, work_dir, dpi=150, max_pages=1)
        if not image_paths:
            raise RuntimeError("Preview render produced no image")

        # Content-addressed dir for base previews (so the cache check above can
        # find it next time); a throwaway uuid dir for content previews.
        dest_dir = cache_dir or f"previews/{file_id}"
        uploads = [
            (out_pptx, f"{dest_dir}/template.pptx", _PPTX_MIME),
            (image_paths[0], f"{dest_dir}/slide1.jpg", "image/jpeg"),
        ]
        pptx_url, slide_url = upload_files_parallel(uploads)

        return {
            "success": True,
            "pptx_url": pptx_url,
            "preview_urls": [slide_url],
            "preview_url": slide_url,
        }

    except Exception as e:
        logger.exception("generate_preview failed for %s", template_url)
        return {"success": False, "error": str(e)}

    finally:
        if owns_work_dir and os.path.isdir(work_dir):
            shutil.rmtree(work_dir, ignore_errors=True)