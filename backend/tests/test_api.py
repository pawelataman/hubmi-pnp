"""Integration checks for the public API contract and origin policy."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def client() -> Iterator[TestClient]:
    settings: Settings = Settings(
        name="Test API",
        version="1.2.3",
        cors_origins=["http://localhost:5173"],
    )
    with TestClient(create_app(settings)) as test_client:
        yield test_client


def test_health_contract(client: TestClient) -> None:
    response: Response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Test API",
        "version": "1.2.3",
    }


def test_openapi_exposes_health(client: TestClient) -> None:
    response: Response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/api/v1/health" in response.json()["paths"]


def test_allowed_origin_preflight(client: TestClient) -> None:
    response: Response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_unknown_origin_is_rejected(client: TestClient) -> None:
    response: Response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.parametrize(
    "origin",
    ["*", "ftp://localhost", "http://localhost/path", "http://localhost:invalid"],
)
def test_invalid_origin_configuration_is_rejected(origin: str) -> None:
    with pytest.raises(ValidationError):
        Settings(cors_origins=[origin])


def test_settings_read_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_NAME", "Configured API")
    monkeypatch.setenv("APP_CORS_ORIGINS", '["https://app.example/"]')

    settings: Settings = Settings()

    assert settings.name == "Configured API"
    assert settings.cors_origins == ["https://app.example"]
