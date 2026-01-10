from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(
        default="sqlite:///./creditlens.db",
        validation_alias="DATABASE_URL",
    )
    cors_origins: str = Field(
        default="http://localhost:3000",
        validation_alias="CORS_ORIGINS",
    )
    max_request_size: int = Field(
        default=1_000_000,
        validation_alias="MAX_REQUEST_SIZE",
    )

    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
