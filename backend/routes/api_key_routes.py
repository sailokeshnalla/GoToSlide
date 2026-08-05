from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.supabase_auth import require_supabase_auth
from services.key_pool_service import (
    assign_or_get_managed_key,
    touch_assignment,
    release_assignment,
    release_all_session_assignments
)
from services.providers.gemini_provider import GeminiProvider

router = APIRouter(prefix="/api/key-assignment", tags=["Key Assignment"])

class ProviderRequest(BaseModel):
    provider: str

@router.post("/ensure")
def ensure_assignment(request: ProviderRequest, auth: dict = Depends(require_supabase_auth)):
    try:
        assignment = assign_or_get_managed_key(auth["user_id"], auth["session_id"], request.provider)
        if not assignment:
            raise HTTPException(status_code=500, detail="Failed to ensure assignment")
            
        # Return safe metadata only
        return {
            "status": "success",
            "provider": request.provider,
            "assigned_at": assignment.get("assigned_at")
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/heartbeat")
def heartbeat_assignment(request: ProviderRequest, auth: dict = Depends(require_supabase_auth)):
    for attempt in range(2):
        try:
            # touch_assignment updates last_activity. If expired, we can just ensure it.
            # Actually, assign_or_get_managed_key does the right thing.
            assignment = assign_or_get_managed_key(auth["user_id"], auth["session_id"], request.provider)
            return {
                "status": "success",
                "provider": request.provider,
                "last_activity": "updated"
            }
        except Exception as e:
            if "10035" in str(e) and attempt == 0:
                import time
                time.sleep(0.1)
                continue
            # Heartbeats are fire-and-forget. Suppress 500 errors to prevent noisy browser console logs.
            return {"status": "error", "detail": f"Best-effort heartbeat skipped: {str(e)}"}

@router.post("/release")
def release_assignment_route(request: ProviderRequest = None, auth: dict = Depends(require_supabase_auth)):
    try:
        if request and hasattr(request, 'provider') and request.provider:
            release_assignment(auth["user_id"], auth["session_id"], request.provider)
            return {"status": "success", "released": request.provider}
        else:
            release_all_session_assignments(auth["user_id"], auth["session_id"])
            return {"status": "success", "released": "all"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed release: {str(e)}")

class UserKeyRequest(BaseModel):
    provider: str
    key: str

@router.get("/user-key")
def get_user_key(provider: str, auth: dict = Depends(require_supabase_auth)):
    try:
        from config.supabase_client import supabase_backend
        res = supabase_backend.table("user_personal_api_keys").select("provider").eq("user_id", auth["user_id"]).eq("provider", provider).execute()
        return {"status": "success", "has_key": len(res.data) > 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check user key: {str(e)}")

@router.post("/user-key")
def save_user_key(request: UserKeyRequest, auth: dict = Depends(require_supabase_auth)):
    try:
        from utils.encryption import encrypt_api_key
        from config.supabase_client import supabase_backend
        
        # Test key format
        if request.provider == "gemini" and not (request.key.startswith("AIza") or request.key.startswith("AQ.")):
            raise HTTPException(status_code=400, detail="Invalid Gemini API key format. It should start with 'AIza' or 'AQ.'.")
            
        encrypted = encrypt_api_key(request.key)
        
        data = {
            "user_id": auth["user_id"],
            "provider": request.provider,
            "encrypted_key": encrypted
        }
        
        # Upsert
        supabase_backend.table("user_personal_api_keys").upsert(data, on_conflict="user_id,provider").execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save user key: {str(e)}")

@router.delete("/user-key")
def delete_user_key(provider: str, auth: dict = Depends(require_supabase_auth)):
    try:
        from config.supabase_client import supabase_backend
        supabase_backend.table("user_personal_api_keys").delete().eq("user_id", auth["user_id"]).eq("provider", provider).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user key: {str(e)}")
