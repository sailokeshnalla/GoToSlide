"""
Supabase Storage helper.

Uploads generated files (pptx / pdf / jpg) and returns a URL the frontend can
use directly. This removes all local-filesystem coupling between Vercel and
Render: the backend never returns a server path, only a URL.

Environment variables (set these on Render):
  SUPABASE_URL                 https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY         service_role key (server-side only, NEVER ship to the browser)
  SUPABASE_BUCKET              bucket name, default "generated"
  SUPABASE_BUCKET_PUBLIC       "true" (public bucket -> public URLs) or "false" (signed URLs)
  SUPABASE_SIGNED_URL_TTL      seconds, used only when the bucket is private (default 3600)
"""

import logging
import mimetypes
import os
from concurrent.futures import ThreadPoolExecutor

from supabase import Client, create_client

logger = logging.getLogger("services.supabase_storage")

_SUPABASE_URL = os.environ.get("SUPABASE_URL")
_SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
_BUCKET = os.environ.get("SUPABASE_BUCKET", "generated")
_PUBLIC = os.environ.get("SUPABASE_BUCKET_PUBLIC", "true").lower() == "true"
_SIGNED_TTL = int(os.environ.get("SUPABASE_SIGNED_URL_TTL", "3600"))

_client: Client | None = None


def is_public_bucket() -> bool:
    """Whether the bucket serves stable public URLs (needed for cache reuse)."""
    return _PUBLIC


def _get_client() -> Client:
    global _client
    if _client is None:
        if not _SUPABASE_URL or not _SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for storage uploads."
            )
        _client = create_client(_SUPABASE_URL, _SUPABASE_KEY)
    return _client


def public_url(dest_path: str) -> str:
    """Public URL for an object in a public bucket."""
    return _get_client().storage.from_(_BUCKET).get_public_url(dest_path)


def object_exists(dest_path: str) -> bool:
    """
    True if `dest_path` already exists in the bucket. Used to skip regenerating
    a base (blank) preview we've already produced for a given template. Never
    raises -- on any error we simply report "not cached" and regenerate.
    """
    try:
        folder, _, name = dest_path.rpartition("/")
        items = _get_client().storage.from_(_BUCKET).list(folder)
        return any(item.get("name") == name for item in items)
    except Exception as e:
        logger.debug("object_exists check failed for %s: %s", dest_path, e)
        return False


def upload_file(local_path: str, dest_path: str, content_type: str = None) -> str:
    """
    Upload a local file to `dest_path` inside the bucket and return its URL.

    `dest_path` example: "previews/<uuid>/slide1.jpg"
    """
    client = _get_client()

    if content_type is None:
        content_type = mimetypes.guess_type(local_path)[0] or "application/octet-stream"

    with open(local_path, "rb") as f:
        data = f.read()

    # upsert lets us overwrite if the same key is uploaded twice.
    client.storage.from_(_BUCKET).upload(
        path=dest_path,
        file=data,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    if _PUBLIC:
        return public_url(dest_path)

    signed = client.storage.from_(_BUCKET).create_signed_url(dest_path, _SIGNED_TTL)
    # key name differs across supabase-py versions
    return signed.get("signedURL") or signed.get("signedUrl") or signed.get("signed_url")


def upload_files_parallel(uploads: list[tuple[str, str, str]], max_workers: int = 6) -> list[str]:
    """
    Upload several files concurrently and return their URLs in the same
    order as `uploads`. Each item is (local_path, dest_path, content_type).

    A single-slide preview only needs one upload, but a multi-slide deck was
    doing one sequential HTTP round trip per slide before -- this is the main
    lever for cutting multi-slide latency, alongside LibreOffice warm-up.
    """
    if not uploads:
        return []

    results = [None] * len(uploads)
    with ThreadPoolExecutor(max_workers=min(max_workers, len(uploads))) as pool:
        futures = {
            pool.submit(upload_file, local_path, dest_path, content_type): i
            for i, (local_path, dest_path, content_type) in enumerate(uploads)
        }
        for future in futures:
            i = futures[future]
            results[i] = future.result()
    return results