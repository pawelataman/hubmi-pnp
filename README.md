# Hubmi

Klikalna wersja demonstracyjna HubMe — Hubu Innowacji Społecznych: React +
TypeScript + Vite oraz API w FastAPI. Frontend działa na danych przykładowych
z makiet; backend udostępnia na razie tylko kontrolę stanu.

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
Adresy API podane w tym README zakładają domyślne porty.

## Kontrola jakości

Po instalacji zależności:

```sh
make check
```

Sprawdza lint, formatowanie, typy i testy obu części oraz produkcyjny build
frontendu. Sam build można wykonać przez `npm run build --prefix frontend`.
Podgląd buildu: `npm run preview --prefix frontend`.

## Struktura

- `frontend/src` — interfejs: `app` (routing, konteksty), `shell` (nagłówek,
  panel boczny), `ui` (wspólne komponenty), `features` (ekrany), `api`
  (typy, interfejs `HubApi`, dane przykładowe).
- `docs/design/hubme-makiety` — źródła makiet, wzorzec wyglądu ekranów.
- `backend/app` — aplikacja FastAPI i ustawienia `APP_*`.
- `backend/tests` — testy integracyjne API i konfiguracji CORS.
- `scripts/dev.py` — wspólne uruchamianie i zatrzymywanie lokalnych serwerów.
- `compose.yaml` — środowisko developerskie w Dockerze.
- `IDEATION.md` — opis planowanej funkcjonalności matchmakingu.

## Wersja demonstracyjna

### Onboarding osoby potrzebującej (POC)

Przycisk **Załóż konto** otwiera `/onboarding`. Pole **Typ osoby** przełącza
formularz: osoba potrzebująca ma działający onboarding, a dostawca innowacji,
instytucja i ekspert otrzymują komunikat „Formularz w przygotowaniu”.

Przycisk **Wypełnij przykładem Jana** uzupełnia fikcyjny profil seniora
szukającego kontaktu z ludźmi. Po zapisie użytkownik sprawdza opis potrzeb,
odpowiada na pytania i przechodzi do przykładowych rekomendacji. Odpowiedzi
wpływają na kolejność propozycji w tym jednym scenariuszu POC. Całość działa
na mockach; embeddingi ani rzeczywiste AI nie są uruchamiane.

Profil jest zapisywany w `localStorage` tej przeglądarki. Demo obsługuje jedno
takie konto; sesja jest zachowywana w `sessionStorage`. Menu konta udostępnia
**Mój profil potrzeb** i **Moje dopasowania**. Utworzone konto pojawia się też
w wyborze osób przy logowaniu. To symulacja konta bez uwierzytelniania, więc
należy korzystać wyłącznie z danych fikcyjnych. Wyszukiwanie jest oddzielone
od scenariuszy pozostałych osób demonstracyjnych.

### Pozostałe scenariusze

Wszystkie dane są przykładowe i pochodzą z makiet w
`docs/design/hubme-makiety`. Frontend nie wysyła żadnych zapytań do backendu:
dane dostarcza `frontend/src/api/mock`, a ekrany korzystają wyłącznie z
interfejsu `HubApi` (`frontend/src/api/HubApi.ts`). Stan zgłoszeń i wątków
trzymany jest w pamięci i znika po odświeżeniu strony.

Logowanie jest zastąpione wyborem jednej z trzech przykładowych osób
(przycisk „Zaloguj się”):

- **Ewa W.** — pracownica GOPS, szuka rozwiązania i dostosowuje je do gminy,
- **Maria N.** — autorka pomysłu, wysyła fiszkę i rozmawia z ROPS,
- **Anna Kowalczyk** — kuratorka ROPS, ma dostęp do panelu pod `/rops`.

Scenariusz w sześciu krokach: opis problemu (`/`) → wyniki i karta innowacji →
„Dostosuj do mojej gminy” → fiszka pomysłu (`/zglos-pomysl`) → kolejka i wątek
w panelu ROPS (`/rops/kolejka`) → trendy potrzeb (`/rops/trendy`).

Biblioteka innowacji (`/biblioteka`) pokazuje 12 przykładowych innowacji
z wyszukiwaniem, filtrami obszaru, typu, kosztu i cech („Szuka testerów”,
„Ma film”) oraz sortowaniem. Stan filtrów jest zapisany w adresie strony, więc
widok można wysłać linkiem. „Dostosuj do mojej gminy” zwraca ten sam
przykładowy szkic dla każdej innowacji.

Funkcje bez makiety (m.in. „Prosty język”, dyktowanie, załączniki, PDF)
pokazują komunikat, że nie są dostępne w wersji demonstracyjnej. Układ jest
przygotowany dla ekranów o szerokości od 1024 px.

Dopasowywanie oparte na embeddingach, opisane w `IDEATION.md`, nie zostało
jeszcze zaimplementowane — wyniki w demie są przykładowe.
