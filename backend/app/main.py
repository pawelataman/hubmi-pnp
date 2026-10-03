"""FastAPI application factory and ASGI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import create_health_router
from app.core.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build an application with validated, optionally injected settings."""
    configuration: Settings = settings if settings is not None else get_settings()
    application: FastAPI = FastAPI(
        title=configuration.name,
        version=configuration.version,
        description="Hubmi backend blueprint. Add application routes under /api/v1.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=configuration.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    application.include_router(create_health_router(configuration), prefix="/api/v1")
    return application


app: FastAPI = create_app()
