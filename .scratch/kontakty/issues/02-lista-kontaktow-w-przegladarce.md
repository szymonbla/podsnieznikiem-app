# 02 — Lista kontaktów w przeglądarce

**What to build:** właściciel wchodzi na `/kontakty` i widzi wszystkie swoje
kontakty w tabeli — imię i nazwisko, specjalizacja, telefon. Dane przychodzą
z prawdziwego API, typy pochodzą z wygenerowanego kontraktu, nie z ręcznego
przepisania.

Domyka tracer bullet z ticketu 01 i ustanawia szew testowy nr 2 oraz konwencję
modułu klienta (`domain` / `configuration` / `integration` / `presentation`,
teksty w `copy.ts`, nie w JSX).

**Blocked by:** 01

**Status:** done

- [x] `bun run gen:api` podnosi serwer, pobiera OpenAPI i zapisuje plik typów; plik jest commitowany
- [x] Klient rozmawia z API przez typowany wrapper na `fetch` opakowany w TanStack Query (`staleTime` 5 min)
- [x] Klient nie importuje niczego z aplikacji serwera; z paczki kontraktów bierze wyłącznie typy — runtime Effecta nie trafia do bundla
- [x] Trasa `/kontakty` w routerze; ekran renderuje tabelę z trzema kolumnami
- [x] Test szwu 2 renderuje ekran z routerem i warstwą zapytań, sieć podstawiona serwerem podszywającym się (nie atrapami modułów); asercje po roli i tekście
