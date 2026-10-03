"""Validated configuration loaded from APP_* environment variables."""

from functools import lru_cache
from urllib.parse import SplitResult, urlsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings shared by the application and its routes."""

    model_config = SettingsConfigDict(env_prefix="APP_", extra="ignore")

    name: str = Field(default="Hubmi API", min_length=1)
    version: str = Field(default="0.1.0", min_length=1)
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    @field_validator("cors_origins")
    @classmethod
    def validate_cors_origins(cls, origins: list[str]) -> list[str]:
        """Require explicit HTTP origins rather than wildcards or URL paths."""
        normalized_origins: list[str] = []
        for origin in origins:
            parsed: SplitResult = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path not in {"", "/"}
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError(f"Invalid CORS origin: {origin!r}")
            # Accessing port also rejects malformed or out-of-range port numbers.
            _ = parsed.port
            normalized_origins.append(origin.rstrip("/"))
        return normalized_origins


@lru_cache
def get_settings() -> Settings:
    """Load and validate environment variables once per process."""
    return Settings()

