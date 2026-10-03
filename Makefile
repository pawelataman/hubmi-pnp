.PHONY: install dev check docker-up docker-down

.DEFAULT_GOAL := dev

install:
	uv sync --project backend --locked
	npm ci --prefix frontend --no-audit --no-fund

dev: install
	backend/.venv/bin/python scripts/dev.py

check:
	cd backend && uv run --locked ruff check app tests ../scripts
	cd backend && uv run --locked ruff format --check app tests ../scripts
	cd backend && uv run --locked mypy app tests ../scripts
	cd backend && uv run --locked pytest
	npm run check --prefix frontend

docker-up:
	docker compose up --build

docker-down:
	docker compose down
