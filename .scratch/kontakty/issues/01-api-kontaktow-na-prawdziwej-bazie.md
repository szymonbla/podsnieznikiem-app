# 01 — API kontaktów na prawdziwej bazie

Spec: [`docs/specs/0001-kontakty.md`](../../../docs/specs/0001-kontakty.md) ·
Architektura: [`docs/DESIGN.md`](../../../docs/DESIGN.md)

**What to build:** uruchomiony serwer, który na `GET /contacts` zwraca komplet
kontaktów z Postgresa i publikuje własne OpenAPI pod Swagger UI. Postgres wstaje
w kontenerze, migracje idą na starcie serwera, brak zmiennej środowiskowej
zatrzymuje start z jasnym komunikatem.

To ticket fundamentowy: ustanawia workspace bun (serwer, klient, kontrakty),
konwencję modułu (`domain` / `integration` / `api`, wyłącznie barrel `index.ts`)
i szew testowy nr 1.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] `docker compose up -d` podnosi Postgres 16; `bun install` działa w workspace
- [x] Migracja tworzy tabelę `contacts` z ograniczeniami z `DESIGN.md` (długości, `phone ~ '^[0-9]{9}$'`, indeks na `name`), bez `deleted_at` i `created_by`
- [x] Kształt `Contact` żyje w paczce kontraktów jako `effect/Schema` i jest jedynym źródłem prawdy
- [x] `GET /contacts` zwraca komplet, **bez parametrów** — żadnego `?q=` ani `?sort=`
- [x] Domyślny porządek odpowiedzi jest przewidywalny (po `name`)
- [x] Swagger UI dostępny pod `/docs`, OpenAPI wyprowadzone z definicji `HttpApi`
- [x] Konfiguracja walidowana schematem na starcie — brak zmiennej zatrzymuje serwer natychmiast
- [x] Test szwu 1 uderza w działające API z prawdziwym Postgresem w kontenerze i sprawdza treść odpowiedzi oraz stan bazy
