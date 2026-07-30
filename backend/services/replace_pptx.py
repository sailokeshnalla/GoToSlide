"""
Produce the final deck in pptx / pdf / image, upload it to Supabase, and
return a download URL. Same rendering engine and the same fill_template()
call as the preview path, so the two can never drift apart.
"""

import logging
import os
import shutil
import tempfile
import uuid

from pptx import Presentation

from services.libreoffice import pptx_to_images, pptx_to_pdf
from services.pptx_fill import fill_template
from services.supabase_storage import upload_file
from services.template_fetch import download_template

logger = logging.getLogger("services.replace_pptx")

_FORMAT_META = {
    "pptx": (
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "pptx",
    ),
    "pdf": ("application/pdf", "pdf"),
    "image": ("image/jpeg", "jpg"),
}


def replace_pptx(
    template_url: str,
    replacements: dict,
    styling: dict = None,
    output_format: str = "pptx",
):
    work_dir = tempfile.mkdtemp(prefix="render_")
    try:
        if not template_url:
            raise ValueError("Template URL is missing")

        out_format = (output_format or "pptx").lower()
        if out_format not in _FORMAT_META:
            out_format = "pptx"

        file_id = uuid.uuid4().hex

        in_path = os.path.join(work_dir, f"{file_id}_in.pptx")
        download_template(template_url, in_path)

        prs = Presentation(in_path)
        fill_template(prs, replacements or {}, styling or {})

        out_pptx = os.path.join(work_dir, f"{file_id}.pptx")
        prs.save(out_pptx)

        # Pick the artifact to deliver.
        if out_format == "pdf":
            final_path = pptx_to_pdf(out_pptx, work_dir)
        elif out_format == "image":
            # A single JPG is delivered, so only slide 1 needs rendering.
            _pdf, images = pptx_to_images(out_pptx, work_dir, dpi=150, max_pages=1)
            if not images:
                raise RuntimeError("Render produced no image")
            final_path = images[0]
        else:
            final_path = out_pptx

        content_type, ext = _FORMAT_META[out_format]
        dest = f"downloads/{file_id}/template.{ext}"
        url = upload_file(final_path, dest, content_type)

        return {
            "success": True,
            "format": out_format,
            "download_url": url,
            "filename": f"template.{ext}",
        }

    except Exception as e:
        logger.exception("replace_pptx failed for %s", template_url)
        return {"success": False, "error": str(e)}

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)