# backend/app/core/config.py

from typing import List, Optional, Any
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Image Generation with Trend Analysis"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default="your-secret-key-here")
    DEBUG: bool = Field(default=False)

    # Database
    DATABASE_URL: str = Field(default="postgresql://user:password@localhost:5432/ai_image_gen")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    CACHE_TTL: int = 3600  # 1 hour cache for trend data

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str] | str:
        if isinstance(v, str) and not v.startswith('['):
            return [i.strip() for i in v.split(',')]
        return v

    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_TRENDS_API_KEY: Optional[str] = None
    TWITTER_API_KEY: Optional[str] = None
    TWITTER_API_SECRET: Optional[str] = None
    
    META_APP_ID: Optional[str] = None
    META_APP_SECRET: Optional[str] = None

    # New lines for Sandbox and Production switching
    META_API_ENVIRONMENT: str = "sandbox"  # Default to sandbox for safety
    META_SANDBOX_AD_ACCOUNT_ID: Optional[str] = None
    META_SANDBOX_PAGE_ID: Optional[str] = None

    # You might need these later for production
    META_PRODUCTION_AD_ACCOUNT_ID: Optional[str] = None
    META_PRODUCTION_PAGE_ID: Optional[str] = None

    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: str = "ai-generated-images"
    AWS_REGION: str = "us-east-1"

    # Image Generation Settings
    MAX_IMAGES_PER_REQUEST: int = 3
    IMAGE_GENERATION_TIMEOUT: int = 300  # 5 minutes

    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")

    # REMOVED The inner Config class to allow for default behavior
    # class Config:
    #     env_file = ".env"
    #     case_sensitive = True

settings = Settings()