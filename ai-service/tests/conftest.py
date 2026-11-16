import os

# Deterministic test-only configuration; never inherits deployment credentials or calls Gemini.
os.environ["AI_SERVICE_TOKEN"] = "test-only-ai-service-token"
os.environ["AI_ALLOWED_ORIGINS"] = "https://inkloomguard.xyz"
os.environ["GEMINI_API_KEY"] = ""
