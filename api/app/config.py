from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    mongodb_url: str
    mongodb_name: str = "medical_records"  # Default database name
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings() 