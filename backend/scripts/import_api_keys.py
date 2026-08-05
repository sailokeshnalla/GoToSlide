import os
import sys
import csv
from dotenv import load_dotenv
from supabase import create_client, Client
from cryptography.fernet import Fernet

# Load environment variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
ENCRYPTION_KEY = os.getenv("API_KEY_ENCRYPTION_KEY") or os.getenv("ENCRYPTION_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not ENCRYPTION_KEY:
    print("Error: Missing credentials in backend/.env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
fernet = Fernet(ENCRYPTION_KEY.encode())

def main():
    csv_path = os.path.join(os.path.dirname(__file__), 'api_keys.csv')
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        sys.exit(1)

    print("=== Starting API Key Bulk Import ===")
    
    # Fetch existing keys to avoid duplicates
    try:
        existing_res = supabase.table("ai_api_keys").select("encrypted_key").execute()
        existing_keys = set()
        for row in existing_res.data:
            try:
                pt = fernet.decrypt(row["encrypted_key"].encode()).decode()
                existing_keys.add(pt)
            except Exception:
                pass
    except Exception as e:
        print(f"Error fetching existing keys: {e}")
        existing_keys = set()
    
    success_count = 0
    skipped_count = 0
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            provider = row.get("provider", "").strip().lower()
            api_key = row.get("api_key", "").strip()

            # Skip empty rows or dummy placeholder text
            if not provider or not api_key or "your_" in api_key:
                continue

            if api_key in existing_keys:
                print(f"[SKIPPED] {provider} key (already exists in database).")
                skipped_count += 1
                continue

            encrypted_key = fernet.encrypt(api_key.encode()).decode()
            
            data = {
                "provider": provider,
                "encrypted_key": encrypted_key,
                "is_active": True
            }
            try:
                supabase.table("ai_api_keys").insert(data).execute()
                print(f"[OK] Successfully encrypted and imported {provider} key.")
                success_count += 1
            except Exception as e:
                print(f"[ERROR] Failed to import {provider} key: {e}")

    print(f"\nFinished! Successfully imported {success_count} new keys. Skipped {skipped_count} existing keys.")

if __name__ == "__main__":
    main()
