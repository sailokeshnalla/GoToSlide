import requests
import json
import os

class GeminiProvider:
    def __init__(self):
        self.default_model = os.environ.get("GEMINI_DEFAULT_MODEL", "gemini-flash-latest")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def generate_content(self, api_key: str, prompt: str, options: dict) -> dict:
        model = options.get("model", self.default_model)
        url = f"{self.base_url}/{model}:generateContent?key={api_key}"
        
        headers = {"Content-Type": "application/json"}
        
        # Build standard Gemini payload
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        if "temperature" in options:
            payload["generationConfig"] = {"temperature": options["temperature"]}

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Extract text safely
            text_response = ""
            if "candidates" in data and len(data["candidates"]) > 0:
                parts = data["candidates"][0].get("content", {}).get("parts", [])
                if parts:
                    text_response = parts[0].get("text", "")
            
            return {
                "success": True,
                "text": text_response,
                "raw_response": data
            }
        except requests.exceptions.RequestException as e:
            return self.classify_provider_error(e)

    def validate_api_key(self, api_key: str) -> bool:
        """Lightweight check to see if the key is structurally valid or recognized by Google."""
        url = f"{self.base_url}/{self.default_model}?key={api_key}"
        try:
            response = requests.get(url, timeout=10)
            return response.status_code == 200
        except:
            return False

    def classify_provider_error(self, error: Exception) -> dict:
        """Classify the error to not expose sensitive info but return meaningful status."""
        error_msg = str(error)
        is_timeout = "timeout" in error_msg.lower()
        
        status_code = None
        if hasattr(error, 'response') and error.response is not None:
            status_code = error.response.status_code
            
        if status_code == 401 or status_code == 403:
            return {"success": False, "error_type": "invalid_key", "message": "API key is invalid or unauthorized"}
        elif status_code == 429:
            return {"success": False, "error_type": "rate_limit", "message": "Rate limit exceeded for this provider"}
        elif is_timeout:
            return {"success": False, "error_type": "timeout", "message": "Provider request timed out"}
            
        return {"success": False, "error_type": "provider_error", "message": f"An error occurred: {status_code}"}
