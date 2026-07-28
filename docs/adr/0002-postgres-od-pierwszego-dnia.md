# PostgreSQL od pierwszego dnia, bez ORM-a

Aplikacja działa na razie wyłącznie lokalnie, dla jednego użytkownika, z jedną
tabelą — SQLite byłby prostszy i nie wymagałby Dockera. Mimo to stawiamy
Postgresa od początku i rozmawiamy z nim surowym SQL-em przez `@effect/sql-pg`,
bez ORM-a.

## Uzasadnienie

Następną planowaną domeną są Rezerwacje, a rezerwacja to przedział dat.
Postgres ma `daterange` i `EXCLUDE USING gist`, które **na poziomie bazy**
uniemożliwiają dwie nachodzące na siebie rezerwacje. SQLite nie ma nawet typu
daty — tę regułę pisałoby się w aplikacji, licząc na to, że nikt jej nie ominie.
Skoro cała platforma opiera się na niedopuszczaniu podwójnych rezerwacji, reguła
powinna mieszkać w bazie. Migracja SQLite → Postgres po zbudowaniu Rezerwacji
byłaby znacznie droższa niż podniesienie kontenera dziś.

ORM odrzuciliśmy, bo dokładałby **trzecie** źródło prawdy o kształcie danych —
obok `effect/Schema` na serwerze i zoda w formularzach ([ADR-0001](./0001-effect-na-serwerze-zod-na-froncie.md)).
Przy jednej tabeli query builder rozwiązuje problem, którego nie mamy, a słabo
owija właśnie te typy Postgresa, dla których go wybraliśmy.

## Konsekwencje

Praca nad projektem wymaga podniesionego Dockera.

Bez ORM-a nie ma autouzupełniania nazw kolumn — literówka w zapytaniu wychodzi
w runtime, nie przy kompilacji. Dlatego testy integracyjne repozytorium na
prawdziwym Postgresie są **obowiązkowe**, a nie opcjonalne: nic innego tych
błędów nie złapie.

Wybór opiera się na hipotezie, że Rezerwacje rzeczywiście powstaną i będą
potrzebować ograniczeń zakresowych. Jeśli hipoteza okaże się fałszywa, była to
przesada.
