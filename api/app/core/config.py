from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str
    mongodb_name: str = "medical_records"  # Default value since not in .env
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Add more configuration variables as needed
    project_name: str = "Medical Records API"
    api_v1_prefix: str = "/api/v1"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        # Use aliases rather than field_mapping
        extra="ignore",  # Ignore extra env variables
        env_nested_delimiter="__",
        aliases={
            "jwt_secret_key": "JWT_SECRET_KEY",
            "mongodb_url": "MONGODB_URL",
            "jwt_algorithm": "JWT_ALGORITHM",
            "access_token_expire_minutes": "ACCESS_TOKEN_EXPIRE_MINUTES"
        }
    )


@lru_cache()
def get_settings():
    return Settings() 