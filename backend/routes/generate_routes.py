from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from middleware.supabase_auth import require_supabase_auth
from services.ai_provider_service import generate_ai_content
from services.key_pool_service import touch_assignment

router = APIRouter(prefix="/api/generate-ai-content", tags=["AI Generation"])

class GenerationRequest(BaseModel):
    provider: str
    prompt: str
    template: Optional[str] = None
    content: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

@router.post("")
def generate_content_endpoint(request: GenerationRequest, auth: dict = Depends(require_supabase_auth)):
    try:
        # Generate content using the centralized ai_provider_service
        result = generate_ai_content(
            user_id=auth["user_id"],
            session_id=auth["session_id"],
            provider=request.provider.lower(),
            prompt=request.prompt,
            options=request.options or {}
        )
        
        # If successfully generated or even if failed gracefully without critical error,
        # we might want to update the assignment activity to show it's in use
        if result.get("success"):
            touch_assignment(auth["user_id"], auth["session_id"], request.provider.lower())
            
        # Return the generated result directly to frontend
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
