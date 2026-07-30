import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_backend_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")

    if not url:
        raise ValueError("SUPABASE_URL environment variable is missing.")
    if not supabase_key:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable is missing.")
        
    return create_client(url, supabase_key)

# Singleton instance for backend use
supabase_backend = get_supabase_backend_client()
