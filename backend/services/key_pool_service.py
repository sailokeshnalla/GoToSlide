import os
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from config.supabase_client import supabase_backend
from utils.encryption import decrypt_api_key

ASSIGNMENT_TIMEOUT_MINUTES = int(os.environ.get("ASSIGNMENT_TIMEOUT_MINUTES", "30"))
VALID_PROVIDERS = {"gemini", "grok"}

def _validate_provider(provider: str):
    if provider not in VALID_PROVIDERS:
        raise ValueError(f"Invalid provider: {provider}")

def assign_or_get_managed_key(user_id: str, session_id: str, provider: str) -> dict:
    """
    Get the existing assignment for this session/provider.
    If none exists or it has expired, assign a new key using the round-robin SQL function.
    """
    _validate_provider(provider)
    
    # 1. Try to find an existing valid assignment
    existing = get_managed_assignment(user_id, session_id, provider)
    if existing:
        # Touch it and return
        touch_assignment(user_id, session_id, provider)
        return existing
        
    # 2. No valid assignment, invoke the PostgreSQL round-robin function via RPC
    for attempt in range(2):
        try:
            rpc_result = supabase_backend.rpc(
                "assign_next_api_key", 
                {"p_user_id": user_id, "p_session_id": session_id, "p_provider": provider}
            ).execute()
            
            assigned_key_id = rpc_result.data
            if not assigned_key_id:
                raise Exception("No key ID returned from round-robin assignment.")
                
            # 3. Return the new assignment
            return get_managed_assignment(user_id, session_id, provider)
        except Exception as e:
            if "10035" in str(e) and attempt == 0:
                import time
                time.sleep(0.1)
                continue
            if attempt == 1:
                raise Exception(f"Failed to assign managed key: {str(e)}")

def get_managed_assignment(user_id: str, session_id: str, provider: str) -> Optional[dict]:
    _validate_provider(provider)
    
    cutoff_time = datetime.utcnow() - timedelta(minutes=ASSIGNMENT_TIMEOUT_MINUTES)
    
    # Query user_api_assignments joined with ai_api_keys
    query = supabase_backend.table("user_api_assignments") \
        .select("*, ai_api_keys(*)") \
        .eq("user_id", user_id) \
        .eq("provider", provider)
        
    if session_id:
        query = query.eq("session_id", session_id)
    else:
        query = query.is_("session_id", "null")
        
    result = query.execute()
    
    if result.data and len(result.data) > 0:
        assignment = result.data[0]
        last_activity_str = assignment.get("last_activity")
        
        # Check expiry
        if last_activity_str:
            # Handle timezone format correctly
            last_activity = datetime.fromisoformat(last_activity_str.replace("Z", "+00:00")).replace(tzinfo=None)
            if last_activity < cutoff_time:
                return None # Expired
                
        return assignment
    return None

def touch_assignment(user_id: str, session_id: str, provider: str):
    _validate_provider(provider)
    query = supabase_backend.table("user_api_assignments") \
        .update({"last_activity": "now()"}) \
        .eq("user_id", user_id) \
        .eq("provider", provider)
        
    if session_id:
        query = query.eq("session_id", session_id)
    else:
        query = query.is_("session_id", "null")
        
    query.execute()

def release_assignment(user_id: str, session_id: str, provider: str):
    _validate_provider(provider)
    query = supabase_backend.table("user_api_assignments") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("provider", provider)
        
    if session_id:
        query = query.eq("session_id", session_id)
    else:
        query = query.is_("session_id", "null")
        
    query.execute()

def release_all_session_assignments(user_id: str, session_id: str):
    if not session_id:
        return
    supabase_backend.table("user_api_assignments") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("session_id", session_id) \
        .execute()

def release_expired_assignments():
    # To be used by the cleanup job
    cutoff = (datetime.utcnow() - timedelta(minutes=ASSIGNMENT_TIMEOUT_MINUTES)).isoformat()
    supabase_backend.table("user_api_assignments") \
        .delete() \
        .lt("last_activity", cutoff) \
        .execute()

def resolve_api_key_for_user(user_id: str, session_id: str, provider: str) -> str:
    """
    Returns the DECRYPTED api key ready for provider usage.
    Never expose this key to the frontend.
    Priority:
    1. User's personal API key (BYOK)
    2. Managed session assignment (from the central pool)
    """
    # 1. Check user_personal_api_keys first (Step 10)
    personal_res = supabase_backend.table("user_personal_api_keys") \
        .select("encrypted_key") \
        .eq("user_id", user_id) \
        .eq("provider", provider) \
        .execute()
        
    if personal_res.data and len(personal_res.data) > 0:
        encrypted_key = personal_res.data[0].get("encrypted_key")
        if encrypted_key:
            return decrypt_api_key(encrypted_key)
            
    # 2. Fall back to managed pool
    assignment = assign_or_get_managed_key(user_id, session_id, provider)
    if not assignment or "ai_api_keys" not in assignment:
        raise Exception(f"Failed to resolve a managed API key for {provider}")
        
    ai_key_record = assignment["ai_api_keys"]
    encrypted_key = ai_key_record.get("encrypted_key")
    if not encrypted_key:
        raise Exception("API key record is missing encrypted key data")
        
    return decrypt_api_key(encrypted_key)
