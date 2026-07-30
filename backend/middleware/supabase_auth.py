import base64
import json
import logging
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.supabase_client import supabase_backend

security = HTTPBearer()
logger = logging.getLogger("GoToSlide")

def _decode_jwt_payload(token: str) -> dict:
    """Helper to decode JWT payload without verification. 
    Only call this AFTER supabase has verified the token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        payload = parts[1]
        padded = payload + '=' * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(padded)
        return json.loads(decoded)
    except Exception:
        return {}

def require_supabase_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI dependency that validates the Supabase JWT.
    Returns a dict with user_id and session_id.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        # get_user inherently calls the Supabase Auth server to verify the JWT
        user_resp = supabase_backend.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = user_resp.user
        
        # Derive the session_id from the JWT payload
        payload = _decode_jwt_payload(token)
        session_id = payload.get("session_id")
        
        # If no session_id is found in token, derive a safe fallback session id
        if not session_id:
            import hashlib
            session_id = hashlib.sha256(token.encode("utf-8")).hexdigest()[:32]
            
        return {
            "user_id": user.id,
            "session_id": session_id,
            "email": user.email
        }
    except Exception as e:
        logger.warning(f"Auth verification failed. Token rejected.")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
