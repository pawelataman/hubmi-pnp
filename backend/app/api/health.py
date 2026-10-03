"""Health endpoint and response contract."""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import Settings


class HealthResponse(BaseModel):
    """Public response used by the frontend and container health checks."""

    status: Literal["ok"] = "ok"
    service: str = Field(min_length=1)
    version: str = Field(min_length=1)


def create_health_router(settings: Settings) -> APIRouter:
    """Create health routes for this application's settings."""
    router: APIRouter = APIRouter(tags=["health"])

    @router.get("/health", response_model=HealthResponse)
    def get_health() -> HealthResponse:
        return HealthResponse(service=settings.name, version=settings.version)

    return router
