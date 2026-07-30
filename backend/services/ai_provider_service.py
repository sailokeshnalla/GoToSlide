import logging
from services.providers.gemini_provider import GeminiProvider
from services.providers.grok_provider import GrokProvider
from services.key_pool_service import resolve_api_key_for_user

logger = logging.getLogger("GoToSlide")

# Instantiate providers
gemini_provider = GeminiProvider()
grok_provider = GrokProvider()

def generate_ai_content(user_id: str, session_id: str, provider: str, prompt: str, options: dict = None) -> dict:
    if options is None:
        options = {}
        
    try:
        # Step 1: Resolve the appropriate API key
        api_key = resolve_api_key_for_user(user_id, session_id, provider)
    except Exception as e:
        logger.error(f"Failed to resolve API key for {provider}: {str(e)}")
        return {"success": False, "error_type": "key_resolution_error", "message": "Failed to obtain an API key for generation"}

    # Step 2: Call the appropriate provider
    try:
        if provider == "gemini":
            return gemini_provider.generate_content(api_key, prompt, options)
        elif provider == "grok":
            return grok_provider.generate_content(api_key, prompt, options)
        else:
            return {"success": False, "error_type": "invalid_provider", "message": f"Unsupported provider: {provider}"}
    except Exception as e:
        logger.error(f"Unexpected error during AI generation with {provider}: {str(e)}")
        return {"success": False, "error_type": "internal_error", "message": "An internal error occurred during generation"}
