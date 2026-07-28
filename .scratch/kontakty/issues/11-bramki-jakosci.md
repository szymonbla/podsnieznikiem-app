# 11 — Bramki jakości

**What to build:** reguły z `DESIGN.md`, które dziś są ustaleniem w dokumencie,
zaczynają być pilnowane maszynowo — żeby dodanie kolejnej sekcji nie wymagało
przebudowy istniejących, a łańcuch typów między serwerem a klientem nie rozjechał
się po cichu.

Świadome ryzyko nazwane w specu: jeśli weryfikacja wygenerowanych typów okaże się
uciążliwa i ktoś ją wyłączy, kompilacja nadal przechodzi — tylko na nieaktualnym
kontrakcie. Dlatego to osobny, jawny ticket.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Lint blokuje import w głąb cudzego modułu — wejściem jest wyłącznie barrel
- [ ] Lint pilnuje kierunku warstw wewnątrz modułu; warstwa domenowa nie importuje niczego
- [ ] Lint blokuje import z aplikacji serwera do klienta i import **wartości** (nie typów) z paczki kontraktów do klienta
- [ ] CI regeneruje typy z OpenAPI i wywala build, gdy commitowany plik jest nieaktualny
- [ ] CI: typecheck bez `any`, lint i wszystkie trzy szwy testowe
- [ ] Weryfikacja, że runtime Effecta nie trafia do bundla klienta
