from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from dotenv import load_dotenv
import os

load_dotenv(override=False)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = Field(..., description="SQLAlchemy DSN, e.g., postgresql+psycopg://localhost/mentra_app")
    API_BEARER_TOKEN: str = Field(..., description="Static bearer token for API access")
    WEBHOOK_TOKEN: str = Field(..., description="Shared secret for webhook header X-Webhook-Token")
    # LLM / Gemini
    GOOGLE_API_KEY: str | None = Field(None, description="Google Gemini API key (legacy env name)")
    GEMINI_API_KEY: str | None = Field(None, description="Google Gemini API key")
    MODEL: str = Field("gemini-1.5-pro", description="Model name; e.g. gemini-2.5-flash")
    GEMINI_MODEL: str | None = Field(None, description="Preferred Gemini model name; overrides MODEL when set")
    REQUEST_TIMEOUT_SECONDS: int = Field(60, description="LLM request timeout in seconds")
    DEV_FAKE_LLM: bool = Field(False, description="If true, return deterministic fake flashcards without calling an LLM")


settings = Settings()  # type: ignore

# Back-compat / effective values helpers
if settings.GEMINI_MODEL:
    settings.MODEL = settings.GEMINI_MODEL  # type: ignore
if not settings.GOOGLE_API_KEY and settings.GEMINI_API_KEY:
    # Prefer GEMINI_API_KEY when provided
    settings.GOOGLE_API_KEY = settings.GEMINI_API_KEY  # type: ignore
