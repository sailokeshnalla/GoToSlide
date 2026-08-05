import requests
import json
import os

class GeminiProvider:
    def __init__(self):
        self.default_model = os.environ.get("GEMINI_DEFAULT_MODEL", "gemini-1.5-flash-latest")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def get_dynamic_model(self, api_key: str) -> str:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            print(f"[GEMINI] Fetching dynamic models...")
            response = requests.get(url, timeout=10)
            print(f"[GEMINI] get_dynamic_model status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                available_models = [m.get("name", "").replace("models/", "") for m in models if "generateContent" in m.get("supportedGenerationMethods", [])]
                print(f"[GEMINI] Available models for this key: {available_models}")
                
                # First try to find a known stable 1.5 flash model
                for name in available_models:
                    if "gemini-1.5-flash" in name:
                        return name
                        
                # Then try 1.5 pro
                for name in available_models:
                    if "gemini-1.5-pro" in name:
                        return name
                        
                # Then try 1.0 pro or generic pro
                for name in available_models:
                    if "gemini-pro" in name or "gemini-1.0-pro" in name:
                        return name
                
                # Exclude experimental/deprecated models from blind fallback
                for name in available_models:
                    if "2.5" not in name and "experimental" not in name:
                        return name
                        
                # Absolute fallback
                if available_models:
                    return available_models[0]
            return self.default_model
        except Exception as e:
            print(f"[GEMINI] Exception in get_dynamic_model: {e}")
            return self.default_model

    def _execute_post(self, api_key: str, model: str, prompt: str, options: dict, max_retries: int = 3) -> dict:
        import time
        url = f"{self.base_url}/{model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if "temperature" in options:
            payload["generationConfig"] = {"temperature": options["temperature"]}

        print(f"[GEMINI] _execute_post targeting model: {model}")
        for attempt in range(max_retries):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                data = response.json()
                
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
                status_code = getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
                print(f"[GEMINI] _execute_post attempt {attempt+1} failed with status: {status_code}")
                if status_code in (429, 500, 502, 503, 504) or "timeout" in str(e).lower():
                    if attempt < max_retries - 1:
                        time.sleep(1.5 ** attempt)
                        continue
                raise e

    def generate_content(self, api_key: str, prompt: str, options: dict) -> dict:
        model = options.get("model", self.default_model)
        
        try:
            return self._execute_post(api_key, model, prompt, options)
        except requests.exceptions.RequestException as e:
            status_code = getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
            
            # If model is invalid or deprecated, try to dynamically fetch one
            if status_code in (400, 404) and "model" not in options:
                fallback = self.get_dynamic_model(api_key)
                
                if fallback and fallback != model:
                    try:
                        return self._execute_post(api_key, fallback, prompt, options)
                    except requests.exceptions.RequestException as e2:
                        return self.classify_provider_error(e2)
            
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
        response_text = ""
        if hasattr(error, 'response') and error.response is not None:
            status_code = error.response.status_code
            try:
                response_text = error.response.text
            except:
                pass
            
        if status_code == 400:
            return {"success": False, "error_type": "bad_request", "message": f"Bad Request from Google API: {response_text}"}
        elif status_code == 401 or status_code == 403:
            return {"success": False, "error_type": "invalid_key", "message": "Your API key is invalid or unauthorized. Please check your settings."}
        elif status_code == 404:
            return {"success": False, "error_type": "model_not_found", "message": f"The AI model is unavailable or key is restricted. Google returned 404: {response_text}"}
        elif status_code == 429:
            return {"success": False, "error_type": "rate_limit", "message": "Rate limit exceeded. The AI provider is receiving too many requests."}
        elif status_code in (500, 502, 503, 504):
            return {"success": False, "error_type": "server_overload", "message": "The AI provider (Gemini) is currently overloaded or down. Please try again in a few moments."}
        elif is_timeout:
            return {"success": False, "error_type": "timeout", "message": "The AI provider took too long to respond. Please try again."}
            
        return {"success": False, "error_type": "provider_error", "message": f"An unexpected error occurred with the AI provider (HTTP {status_code})."}
