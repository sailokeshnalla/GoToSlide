import os
from cryptography.fernet import Fernet, InvalidToken

def get_fernet_instance():
    key = os.environ.get("API_KEY_ENCRYPTION_KEY")
    if not key:
        raise ValueError("API_KEY_ENCRYPTION_KEY is missing from environment variables.")
    try:
        return Fernet(key.encode("utf-8"))
    except Exception as e:
        raise ValueError(f"Malformed API_KEY_ENCRYPTION_KEY: {str(e)}")

def encrypt_api_key(plain_key: str) -> str:
    if not plain_key or not plain_key.strip():
        raise ValueError("Cannot encrypt an empty API key.")
    f = get_fernet_instance()
    # encrypt returns bytes, we need to store as string
    encrypted_bytes = f.encrypt(plain_key.strip().encode("utf-8"))
    return encrypted_bytes.decode("utf-8")

def decrypt_api_key(encrypted_key: str) -> str:
    if not encrypted_key or not encrypted_key.strip():
        raise ValueError("Cannot decrypt an empty ciphertext.")
    f = get_fernet_instance()
    try:
        decrypted_bytes = f.decrypt(encrypted_key.strip().encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except InvalidToken:
        raise ValueError("Invalid ciphertext or encryption key mismatch.")
    except Exception as e:
        raise ValueError(f"Failed to decrypt API key: {str(e)}")
