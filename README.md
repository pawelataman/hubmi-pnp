# Hubmi

Szkielet aplikacji: React + TypeScript + Vite oraz API w FastAPI. Strona startowa
wykonuje prawdziwe żądanie do backendu i pokazuje stan połączenia.

## Uruchomienie lokalne

Wymagania: Node.js **24**, **uv**, Python **3.13** i `make` (macOS lub Linux).
uv może pobrać Pythona automatycznie, jeśli wskazana wersja nie jest zainstalowana.

Z katalogu głównego projektu:

```sh
make dev
```

Komenda instaluje zależności według plików blokujących wersje i uruchamia oba
serwery z automatycznym przeładowaniem po zmianach w kodzie. Docker nie jest
wymagany. Pierwsze uruchomienie wymaga dostępu do internetu.

- Aplikacja: <http://localhost:5173>
- API: <http://localhost:8000/api/v1/health>
- Dokumentacja API: <http://localhost:8000/docs>

`Ctrl+C` zatrzymuje oba serwery. Jeśli któryś serwer zakończy działanie, drugi
również zostanie zatrzymany. Porty **5173** i **8000** muszą być wolne.

Można też uruchomić serwery osobno, w dwóch terminalach, po `make install`:

```sh
cd backend
uv run --locked uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```sh
cd frontend
npm run dev
```

Frontend przekazuje żądania `/api` do `http://127.0.0.1:8000` przez proxy Vite.
Inny adres backendu można ustawić przez `API_PROXY_TARGET`, np.
`API_PROXY_TARGET=http://127.0.0.1:9000 npm run dev`.

## Docker Compose

Alternatywnie, z działającym Dockerem i Compose:

```sh
docker compose up --build
```

Adresy są takie same jak przy uruchomieniu bez Dockera. Zatrzymanie:

```sh
docker compose down
```

Porty hosta można zmienić przez `FRONTEND_PORT` i `BACKEND_PORT`, np.
`FRONTEND_PORT=5174 BACKEND_PORT=8001 docker compose up --build`.
Bezpośrednie linki do API na stronie startowej używają domyślnych portów.

## Kontrola jakości

Po instalacji zależności:

```sh
make check
```

Sprawdza lint, formatowanie, typy i testy obu części oraz produkcyjny build
frontendu. Sam build można wykonać przez `npm run build --prefix frontend`.
Podgląd buildu: `npm run preview --prefix frontend`; do połączenia z API używaj
serwera developerskiego (`make dev`).

## Struktura

- `frontend/src` — interfejs i klient API.
- `backend/app` — aplikacja FastAPI i ustawienia `APP_*`.
- `backend/tests` — testy integracyjne API i konfiguracji CORS.
- `scripts/dev.py` — wspólne uruchamianie i zatrzymywanie lokalnych serwerów.
- `compose.yaml` — środowisko developerskie w Dockerze.
- `IDEATION.md` — opis planowanej funkcjonalności matchmakingu.

Obecna aplikacja jest bazą do dalszego rozwoju. Matchmaking opisany w
`IDEATION.md` nie został jeszcze zaimplementowany.
