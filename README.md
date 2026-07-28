# Pod Śnieżnikiem

Platforma do obsługi jednego domku na wynajem.

Słownik: [`CONTEXT.md`](./CONTEXT.md) · Architektura: [`docs/DESIGN.md`](./docs/DESIGN.md) ·
Decyzje: [`docs/adr/`](./docs/adr) · Specyfikacje: [`docs/specs/`](./docs/specs)

## Uruchomienie lokalne

```bash
cp .env.example .env
bun run db:up        # Postgres 16 w kontenerze
bun install
bun run dev          # serwer :3000, migracje idą na starcie
# w osobnym terminalu:
bun run db:seed      # 24 kontakty przykładowe (opcjonalnie, można powtarzać)
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
| `bun run db:seed` | wgrywa 24 kontakty przykładowe; ponowne uruchomienie nic nie dubluje |
| `bun run dev` | serwer z przeładowaniem |
| `bun run dev:client` | klient Vite |
| `bun run gen:api` | regeneruje typy klienta z OpenAPI |
| `bun run typecheck` | `tsc --noEmit` na serwerze i na kliencie |
| `bun run test` | pełny zestaw testów (wymaga działającego Postgresa) |
| `bun run test:client` | sam szew 2 — ekran z routerem, zapytaniami i MSW |

Package manager, runtime i test runner to **bun**. Nigdy npm/pnpm/yarn.
