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
```

- `GET http://localhost:3000/contacts` — komplet kontaktów
- `http://localhost:3000/docs` — Swagger UI
- `http://localhost:3000/docs/openapi.json` — dokument OpenAPI

Konfiguracja przez zmienne środowiskowe, walidowana schematem na starcie —
brak `DATABASE_URL` zatrzymuje serwer natychmiast.

## Komendy

| Komenda | Co robi |
|---|---|
| `bun run db:up` | podnosi Postgresa |
| `bun run dev` | serwer z przeładowaniem |
| `bun run typecheck` | `tsc --noEmit` na całym workspace |
| `bun test` | pełny zestaw testów (wymaga działającego Postgresa) |

Package manager, runtime i test runner to **bun**. Nigdy npm/pnpm/yarn.
