import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Loads backend/.env into os.environ for local runs. On Render (or anywhere
# env vars are already set by the platform), this is a harmless no-op --
# load_dotenv() never overrides a variable that's already set.
load_dotenv()

from services.detect_placeholders import detect_placeholders
from services.generate_preview import generate_preview
from services.libreoffice import find_soffice, warm_up
from services.replace_pptx import replace_pptx

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("GoToSlide")

app = FastAPI(title="GoToSlide Backend", version="2.1.0")

from routes.api_key_routes import router as api_key_router
from routes.generate_routes import router as generate_router
app.include_router(api_key_router)
app.include_router(generate_router)

# Frontend (Vercel) and backend (Render) live on different domains, so CORS
# has to be explicit. Set FRONTEND_ORIGINS to a comma-separated list of
# allowed origins in production, e.g. "https://GoToSlide.app,https://www.GoToSlide.app".
# Falls back to "*" only when nothing is configured, so local dev keeps working.
_origins = os.environ.get("FRONTEND_ORIGINS", "*")
_allow_origins = ["*"] if _origins == "*" else [o.strip() for o in _origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=_allow_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    warm_up()  # best-effort; shaves cold-start latency off the first request
    
    # Start the background inactivity cleanup task
    import asyncio
    from services.key_pool_service import release_expired_assignments
    
    async def cleanup_task():
        while True:
            try:
                release_expired_assignments()
            except Exception as e:
                logger.error(f"Inactivity cleanup failed: {e}")
            await asyncio.sleep(60) # Run every 60 seconds
            
    asyncio.create_task(cleanup_task())


class DetectRequest(BaseModel):
    templateUrl: str = Field(..., min_length=1)


class PreviewRequest(BaseModel):
    templateUrl: str = Field(..., min_length=1)
    replacements: dict = {}


class ReplaceRequest(BaseModel):
    templateUrl: str = Field(..., min_length=1)
    replacements: dict = {}
    styling: dict = {}
    format: str = "pptx"


@app.get("/")
def root():
    return {"status": "running", "service": "GoToSlide Backend"}


@app.get("/health")
def health():
    """Confirms the rendering engine is reachable on this host."""
    try:
        return {"status": "ok", "soffice": find_soffice()}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/detect-placeholders")
def detect(request: DetectRequest):
    return detect_placeholders(request.templateUrl)


@app.post("/generate-preview")
def preview(request: PreviewRequest):
    return generate_preview(request.templateUrl, request.replacements)


@app.post("/replace-pptx")
def replace(request: ReplaceRequest):
    return replace_pptx(
        request.templateUrl,
        request.replacements,
        request.styling,
        request.format,
    )