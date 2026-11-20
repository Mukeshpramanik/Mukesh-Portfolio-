import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Mukesh Pramanik Portfolio API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database configuration
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/mukesh_portfolio"

    # Security configuration
    SECRET_KEY: str = "mukesh-portfolio-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Admin credentials
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "change-this-password"

    # CORS configuration
    FRONTEND_URL: str = "http://localhost:3000"

    # File uploads configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5 MB in bytes

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_URL.rstrip("/")]
        if "http://localhost:3000" not in origins:
            origins.append("http://localhost:3000")
        if "http://127.0.0.1:3000" not in origins:
            origins.append("http://127.0.0.1:3000")
        return origins


settings = Settings()
