from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Default to SQLite for stable local/preview execution
    # Render or Prod env vars will override this
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cloud_deploy.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Critical: Allow all origins in preview to avoid CORS issues
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "*")
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    APP_NAME: str = "Cloud Deploy API Gateway"
    VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" 

settings = Settings()
