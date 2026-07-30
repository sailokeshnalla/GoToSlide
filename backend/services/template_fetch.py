"""
Shared "download the template" step for detect_placeholders, generate_preview
and replace_pptx. Pulled out on its own so every path validates/limits
downloads identically instead of drifting apart.
"""

import requests

# Template files aren't presentations you'd expect to be huge; cap the
# download so a bad/huge URL can't tie up a worker or exhaust memory.
MAX_TEMPLATE_BYTES = 50 * 1024 * 1024  # 50 MB
DOWNLOAD_TIMEOUT = 30


def download_template(template_url: str, dest_path: str) -> None:
    """
    Stream `template_url` to `dest_path`.

    Only https is accepted. This is a minimal SSRF guard -- the backend
    fetches whatever URL the client sends, so anything less would let a
    caller point it at internal/metadata endpoints. If templates only ever
    come from your own Supabase bucket, consider tightening this further to
    an explicit allowlist of your Supabase project's hostname.
    """
    if not template_url.lower().startswith("https://"):
        raise ValueError("templateUrl must be an https URL")

    with requests.get(template_url, timeout=DOWNLOAD_TIMEOUT, stream=True) as resp:
        resp.raise_for_status()
        size = 0
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 256):
                size += len(chunk)
                if size > MAX_TEMPLATE_BYTES:
                    raise ValueError("Template file exceeds the 50MB size limit")
                f.write(chunk)