# Pod Śnieżnikiem

Platforma do obsługi jednego domku na wynajem.

Słownik: [`CONTEXT.md`](./CONTEXT.md) · Architektura: [`docs/DESIGN.md`](./docs/DESIGN.md) ·
Decyzje: [`docs/adr/`](./docs/adr) · Specyfikacje: [`docs/specs/`](./docs/specs)

## Uruchomienie lokalne

Wymagane: [bun](https://bun.sh) i Docker.

```bash
bun install
cp .env.example .env
bun run db:up        # Postgres 16 w kontenerze
bun run dev          # serwer :3000, migracje idą na starcie
# w osobnym terminalu:
bun run dev:client   # klient :5173, proxy /api → :3000
```

- `http://localhost:5173/kontakty` — ekran Kontakty
- `GET http://localhost:3000/contacts` — komplet kontaktów
- `http://localhost:3000/docs` — Swagger UI
- `http://localhost:3000/docs/openapi.json` — dokument OpenAPI

Typy klienta powstają z dokumentu OpenAPI: `bun run gen:api` podnosi serwer,
pobiera kontrakt i zapisuje `apps/client/src/generated/api.d.ts`. Plik jest
commitowany — po zmianie API trzeba go przegenerować.

Konfiguracja przez zmienne środowiskowe, walidowana schematem na starcie —
brak `DATABASE_URL` zatrzymuje serwer natychmiast.

## Komendy

| Komenda | Co robi |
|---|---|
| `bun run db:up` | podnosi Postgresa |
| `bun run dev` | serwer z przeładowaniem |
| `bun run dev:client` | klient Vite |
| `bun run start` | serwer bez przeładowania |
| `bun run gen:api` | regeneruje typy klienta z OpenAPI |
| `bun run typecheck` | `tsc --noEmit` na serwerze i na kliencie |
| `bun run lint` | ESLint, w tym granice modułów |
| `bun run test` | pełny zestaw testów (wymaga działającego Postgresa) |
| `bun run test:server` | szew 1 i 3 — repozytorium na prawdziwej bazie, kontrakty |
| `bun run test:client` | sam szew 2 — ekran z routerem, zapytaniami i MSW |
| `bun run build:client` | produkcyjny build klienta |
| `bun run check:api` | pilnuje, że `api.d.ts` nadąża za OpenAPI |
| `bun run check:bundle` | pilnuje, że runtime Effecta nie trafia do przeglądarki |

Package manager, runtime i test runner to **bun**. Nigdy npm/pnpm/yarn.

CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) puszcza to samo na każdym
PR-ze i pushu na `main`, z Postgresem jako usługą.

## Dane

Repo nie zawiera prawdziwych danych — kontakty w testach i w makietach
`docs/DESIGN/` są zmyślone, a numery telefonów nie należą do nikogo znanego
autorowi. Konfiguracja idzie przez `.env` (ignorowany); `.env.example` trzyma
wyłącznie lokalne wartości deweloperskie.
