import requests
import json
import os

class GrokProvider:
    def __init__(self):
        self.default_model = os.environ.get("GROK_DEFAULT_MODEL", "grok-beta")
        self.base_url = os.environ.get("XAI_BASE_URL", "https://api.x.ai/v1")

    def generate_content(self, api_key: str, prompt: str, options: dict) -> dict:
        model = options.get("model", self.default_model)
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        # standard OpenAI-compatible payload format for xAI
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        if "temperature" in options:
            payload["temperature"] = options["temperature"]

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            text_response = ""
            if "choices" in data and len(data["choices"]) > 0:
                text_response = data["choices"][0].get("message", {}).get("content", "")
                
            return {
                "success": True,
                "text": text_response,
                "raw_response": data
            }
        except requests.exceptions.RequestException as e:
            return self.classify_provider_error(e)

    def validate_api_key(self, api_key: str) -> bool:
        url = f"{self.base_url}/models"
        headers = {"Authorization": f"Bearer {api_key}"}
        try:
            response = requests.get(url, headers=headers, timeout=10)
            return response.status_code == 200
        except:
            return False

    def classify_provider_error(self, error: Exception) -> dict:
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
