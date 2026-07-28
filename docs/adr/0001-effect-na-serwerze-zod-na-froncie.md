# Effect Schema na serwerze, zod na froncie

Backend stoi na Effekcie, którego `effect/Schema` jest naturalnym systemem
walidacji — a mimo to formularze na froncie używają zoda z react-hook-form.
To dwa systemy schematów w jednej aplikacji, świadomie.

## Uzasadnienie

Rozważaliśmy ujednolicenie w obie strony: Hono + zod wszędzie, albo Effect
+ `effect/Schema` wszędzie. Wybraliśmy podział, bo obie warstwy rozwiązują różne
problemy. Serwer potrzebuje typowanych błędów w sygnaturze i wyprowadzenia
OpenAPI z definicji API — to daje Effect. Formularz potrzebuje walidacji
per-pole, komunikatów po polsku i integracji z react-hook-form — to daje zod,
przy dojrzalszej ergonomii i większym zasobie odpowiedzi w internecie.
Podwójna walidacja i tak nie jest marnotrawstwem: serwer nie może ufać klientowi.

## Konsekwencje

Ryzykiem jest dryf kontraktu — zod pozwala na coś, czego API nie przyjmuje,
a kompilator milczy. Domykamy to asercją typową w
`modules/contacts/domain/schema.ts`, porównującą **wyjście** zoda (czyli stan po
transformacji, nie surowe wartości formularza) z typem żądania wygenerowanym
z OpenAPI. Rozjazd = błąd kompilacji.

Runtime Effecta nie może trafić do przeglądarki. Front importuje
z `packages/contracts` wyłącznie typy (`import type`); pilnuje tego reguła
ESLint i weryfikacja rozmiaru bundla.
