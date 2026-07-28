# Pod Śnieżnikiem

Narzędzie wewnętrzne do obsługi **jednego** domku na wynajem. Jeden użytkownik —
właściciel. Bez logowania, bez ról, bez wyboru domku.

Ta jedność nie jest uproszczeniem na później, tylko założeniem architektury:
nie ma „wybranego domku" ani autora zmiany, bo odpowiedź zawsze byłaby ta sama.

## Stan

Gotowa domena **Kontakty** — fachowcy, do których dzwoni właściciel: lista
z sortowaniem i wyszukiwaniem, dodawanie, edycja, usuwanie z „Cofnij",
ostrzeżenie o powtórzonym numerze.

Rezerwacje, Finanse i Zapytania są w nawigacji jako „Wkrótce". Architektura ma
je przyjąć, nie zgadywać.

## Jak to jest zbudowane

TypeScript bez `any`, po obu stronach. **Effect** na serwerze — błędy siedzą
w sygnaturze, a dokument OpenAPI powstaje z definicji API, nie obok niej.
Z niego generują się typy klienta, więc rozjazd kontraktu psuje build zamiast
produkcji. **React 19** i **TanStack** (Router, Query) na froncie, **Postgres**
od pierwszego dnia — pod przyszłe Rezerwacje, których terminów nie da się
uczciwie pilnować bez `EXCLUDE USING gist`.

Testy uderzają w trzy szwy: repozytorium w prawdziwą bazę, ekran w router
z zapytaniami, klient w kontrakt serwera.

Runtime, package manager i test runner to **bun**.

## Dokumentacja

| Gdzie | Co |
|---|---|
| [`CONTEXT.md`](./CONTEXT.md) | słownik domenowy — co znaczy „kontakt", „specjalizacja" |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | architektura: warstwy, kontrakt, baza, błędy |
| [`docs/adr/`](./docs/adr) | decyzje z uzasadnieniem |
| [`docs/specs/`](./docs/specs) | specyfikacje domen |

## Uruchomienie

Potrzebne: [bun](https://bun.sh) i Docker.

```bash
bun install && cp .env.example .env
bun run db:up      # Postgres 16 w kontenerze
bun run dev        # serwer :3000, migracje idą na starcie
bun run dev:client # osobny terminal — klient :5173
```

Ekran: `localhost:5173/kontakty`. Kontrakt: `localhost:3000/docs`.

Repo nie zawiera prawdziwych danych — kontakty w testach i makietach są
zmyślone. Konfiguracja idzie przez `.env`, ignorowany przez git.
