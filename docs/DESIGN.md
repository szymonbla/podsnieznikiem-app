# Design — Pod Śnieżnikiem

Platforma do obsługi jednego domku na wynajem. Narzędzie wewnętrzne właściciela,
bez logowania, bez ról. MVP.

Słownik pojęć: [`CONTEXT.md`](../CONTEXT.md). Decyzje z uzasadnieniem:
[`docs/adr/`](./adr).

---

## 1. Zakres

**Wchodzi:**
- Kompletna architektura — repo, warstwy, kontrakt front↔back, baza, błędy
- Domena **Kontakty** w całości, gotowa do implementacji

**Nie wchodzi:**
- Rezerwacje, Finanse, Zapytania — w nawigacji jako "Wkrótce", bez ekranów.
  Kolejne sekcje nie są jeszcze znane; architektura ma je przyjąć, nie zgadywać.
- Autoryzacja, część publiczna, wdrożenie na AWS — odłożone świadomie

**Ograniczenia przyjęte na wejściu:** jeden domek, jeden użytkownik, TypeScript
bez `any`, uruchamiane lokalnie.

---

## 2. Stack

| Warstwa | Wybór | Dlaczego |
|---|---|---|
| Runtime, package manager, testy | **bun** | jedno narzędzie zamiast trzech |
| Backend | **Effect** + `@effect/platform` `HttpApi` | typowane błędy w sygnaturze, OpenAPI z definicji API |
| Schematy serwera | **`effect/Schema`** | jedno źródło dla walidacji, dekodowania SQL i OpenAPI |
| Baza | **PostgreSQL 16** + `@effect/sql-pg`, surowy SQL | `daterange` + `EXCLUDE USING gist` pod przyszłe Rezerwacje ([ADR-0002](./adr/0002-postgres-od-pierwszego-dnia.md)) |
| Migracje | `@effect/sql` Migrator | ponumerowane pliki `.ts`, uruchamiane na starcie |
| Frontend | **React 19** + **Vite** | |
| Routing | **TanStack Router** (trasy w kodzie) | otypowane i walidowane search params |
| Serwer danych | **TanStack Query** | |
| Klient HTTP | **`openapi-fetch`** + **`openapi-typescript`** | kontrakt wymuszany typami, 0 kB runtime'u |
| Formularze | **react-hook-form** + **zod** | ([ADR-0001](./adr/0001-effect-na-serwerze-zod-na-froncie.md)) |
| UI | **shadcn/ui** + **Tailwind v4** | tokeny nadpisane paletą z projektu |
| Toasty | **sonner** | ma `action` — obsługuje "Cofnij" |
| Ikony | **lucide-react** | |

**Świadomie pominięte w MVP:** TanStack Table (jedna tabela, trzy kolumny),
ORM (trzecie źródło prawdy o kształcie danych), Turborepo (dwie aplikacje),
i18n (interfejs jest po polsku i nie ma planu, żeby przestał), Playwright
(dojdzie, gdy będzie więcej niż jeden ekran).

---

## 3. Struktura repo

Bun workspaces. Trzy paczki. Konwencja modułów przeniesiona z
[gon-stack](https://github.com/polubis/gon-stack).

```
apps/
  server/
    src/
      core/                    # bootstrap, warstwy, konfiguracja
        server.ts              #   entrypoint
        layers.ts              #   SqlClient, konfiguracja, kompozycja
        migrator.ts
      modules/
        contacts/
          index.ts             # jedyne publiczne wejście modułu
          domain/
            models.ts          #   Contact, ContactId
            errors.ts          #   ContactNotFound
          integration/
            repository.ts      #   SQL
          api/
            endpoints.ts       #   definicja HttpApiGroup
            handlers.ts        #   implementacja
          __tests__/
      migrations/
        0001_create_contacts.ts

  client/
    src/
      core/
        main.tsx               # entrypoint
        router.tsx             # drzewo tras
        query.ts               # QueryClient
        api.ts                 # klient openapi-fetch
        layouts/
          app-shell.tsx        # sidebar + content
        style/
          index.css            # @theme — tokeny
          fonts.css
      libs/
        ui/                    # shadcn — button, input, dialog, table, ...
      modules/
        contacts/
          index.ts
          domain/
            models.ts          #   typy z generated/api.d.ts
            schema.ts          #   schematy zod dla formularza
          configuration/
            constraints.ts     #   limity długości, wzorzec telefonu
          integration/
            queries.ts         #   hooki react-query
            format.ts          #   formatowanie i normalizacja numeru
          presentation/
            main.tsx           #   ekran
            copy.ts            #   wszystkie teksty
            contacts-table.tsx
            contact-form-dialog.tsx
            delete-dialog.tsx
            row-menu.tsx
            empty-state.tsx
            use-contact-list.ts  # filtrowanie, sortowanie, stan z URL
          __tests__/
      generated/
        api.d.ts               # z OpenAPI, commitowany

packages/
  contracts/                   # effect/Schema — wspólny kształt danych
    src/contact.ts

docker-compose.yml             # tylko Postgres
```

**Reguły struktury:**
- Moduł wystawia **wyłącznie `index.ts`**. Import w głąb cudzego modułu
  (`modules/contacts/integration/...`) blokowany przez ESLint.
- Warstwy wewnątrz modułu idą w jedną stronę:
  `domain` ← `configuration` ← `integration` ← `presentation`. `domain` nie
  importuje niczego z pozostałych.
- Teksty widoczne dla użytkownika żyją w `copy.ts`, nie w JSX.
- `core/` to powłoka aplikacji — nie wolno w nim trzymać logiki domenowej.

**Granica klient/serwer** jest fizyczna — przebiega po `apps/`. Klient nigdy nie
importuje z `apps/server`. Z `packages/contracts` wolno mu brać wyłącznie typy
(`import type`), nigdy wartości — inaczej runtime Effecta ląduje w przeglądarce.
Pilnuje tego reguła ESLint `no-restricted-imports` i weryfikacja rozmiaru bundla.

---

## 4. Design tokens

Wyciągnięte z dostarczonego HTML-a. Wchodzą do `apps/client/src/core/style/index.css`
jako `@theme` Tailwinda v4, dzięki czemu shadcn dziedziczy paletę zamiast domyślnej.

### Kolory

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--color-foreground` | `#2D3142` | tekst, tło sidebara |
| `--color-foreground-strong` | `#1D2130` | hover na ciemnym |
| `--color-primary` | `#2E7C82` | akcent, linki, focus ring |
| `--color-primary-subtle` | `rgba(46,124,130,0.12)` | tło aktywnej pozycji nawigacji |
| `--color-background` | `#FFFFFF` | |
| `--color-muted` | `#F4F5F7` | tło treści, nagłówek tabeli |
| `--color-muted-hover` | `#F0F1F4` | |
| `--color-surface` | `#FCFCFD` / `#FAFBFC` | karty, wiersze |
| `--color-destructive` | `#C4462A` | usuwanie |
| `--color-destructive-subtle` | `#FDEEE7` | tło ostrzeżenia |

Przezroczystości tekstu na białym — `rgba(45,49,66,α)`:
`0.70` nagłówki tabeli · `0.55` tekst drugorzędny · `0.38` placeholder ·
`0.16` obramowanie · `0.09` separator.

### Typografia

- Nagłówki: **Bricolage Grotesque** 600/700, `letter-spacing: -0.02em` / `-0.03em`
- Tekst: **Nunito** 400/500
- Skala: 12 / 13 / 14 / 15 / 19 px. `14px` to domyślny rozmiar interfejsu.
- Etykiety wersalikami: 12 px, `letter-spacing: 0.03em`
- Fonty **hostowane lokalnie** (woff2 wypakowane z bundla), nie z Google Fonts —
  jedna zależność sieciowa mniej i brak wysyłki IP do Google.

### Kształt i przestrzeń

- Promienie: `8px` pola i przyciski · `10–12px` karty i modale · `16px` duże
  powierzchnie · `999px` pigułki
- Powłoka: `grid-template-columns: 264px 1fr`
- Wiersz tabeli: `minmax(0,2fr) minmax(0,1.4fr) minmax(110px,170px) 44px`
- Odstępy: `24px` wewnątrz kart · `10px 12px` w polach · `10px 18px` w przyciskach

### Zachowanie

- Focus: `2px solid var(--color-primary)`, `outline-offset: 2px` — **nie usuwać**
- Breakpoint `900px`: sidebar staje się poziomym paskiem, grupa "Wkrótce"
  i stopka znikają
- Animacje `fadeUp` (6 px) i `popIn` (4 px, scale .98), obie wyłączane przez
  `prefers-reduced-motion`

---

## 5. Kontrakt front↔back

Jeden kierunek przepływu, bez ręcznego przepisywania kształtów:

```
packages/contracts (effect/Schema)
        │
        ├──► apps/server  ── walidacja wejścia, dekodowanie wierszy SQL
        │
        └──► HttpApi ──► /docs/openapi.json
                              │
                    openapi-typescript
                              │
                              ▼
              apps/client/src/generated/api.d.ts   (typy, 0 kB)
                              │
                    openapi-fetch + react-query
```

Zod **nie uczestniczy** w tym łańcuchu. Opisuje wyłącznie formularz — pola,
komunikaty, moment walidacji. Powiązanie z kontraktem trzyma asercja typowa:

```ts
// apps/client/src/modules/contacts/domain/schema.ts
type _EnsureContract = Expect<
  Equal<z.output<typeof createContactSchema>, CreateContactBody>
>
```

Rozjazd między formularzem a API = błąd kompilacji, nie 400-tka w runtime.
Uwaga: asercja porównuje **wyjście** zoda, czyli stan po transformacji — pole
telefonu trzyma `"602 118 447"`, a do API idzie `"602118447"`.

**Regeneracja:** `bun run gen:api` podnosi serwer, pobiera OpenAPI, zapisuje
`api.d.ts`. Plik jest commitowany. CI powtarza to i robi `git diff --exit-code` —
nieaktualny plik wywala build.

---

## 6. Model danych

```sql
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null check (length(trim(name)) between 1 and 100),
  role       text        not null check (length(trim(role)) between 1 and 60),
  phone      text        not null check (phone ~ '^[0-9]{9}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_name_idx on contacts (name);
```

- **Brak unikalności numeru.** Jedna osoba wykonująca dwa fachy to dwa kontakty
  o tym samym numerze — patrz `CONTEXT.md`.
- `phone` przechowywany jako **dziewięć cyfr**, bez prefiksu i formatowania.
  Normalizacja odbywa się w formularzu; baza waliduje wynik.
- Sortowanie nie odbywa się w SQL-u — indeks na `name` daje tylko domyślny,
  przewidywalny porządek odpowiedzi. Właściwe sortowanie po polsku robi klient.
- Brak kolumn `deleted_at` i `created_by` — usuwanie jest trwałe
  ([ADR-0003](./adr/0003-twarde-usuwanie-z-cofnij.md)), a autor zawsze ten sam.

---

## 7. API

Grupa `contacts`. Swagger UI pod `/docs`.

| Metoda | Ścieżka | Wejście | Wyjście | Błędy |
|---|---|---|---|---|
| `GET` | `/contacts` | — | `Contact[]` | — |
| `POST` | `/contacts` | `CreateContactBody` | `Contact` (201) | 400 |
| `PATCH` | `/contacts/:id` | `UpdateContactBody` | `Contact` | 400, `ContactNotFound` |
| `DELETE` | `/contacts/:id` | — | 204 | `ContactNotFound` |

```ts
const Contact = Schema.Struct({
  id:        ContactId,                                    // Schema.UUID, branded
  name:      Schema.String.pipe(Schema.trimmed(), Schema.minLength(1), Schema.maxLength(100)),
  role:      Schema.String.pipe(Schema.trimmed(), Schema.minLength(1), Schema.maxLength(60)),
  phone:     Schema.String.pipe(Schema.pattern(/^\d{9}$/)),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})

const CreateContactBody = Contact.pipe(Schema.omit("id", "createdAt", "updatedAt"))
const UpdateContactBody = Schema.partial(CreateContactBody)
```

- **Tworzenie wymaga kompletu.** `POST` bez `role` to 400.
- **Edycja jest częściowa.** `PATCH` pomija pole → zostaje bez zmian. Pola nie
  mogą być puste, więc raz ustawionej specjalizacji nie da się wyczyścić, tylko
  nadpisać. Świadome uproszczenie.
- **`GET /contacts` zwraca komplet**, bez parametrów. Filtrowanie i sortowanie
  są po stronie klienta — zbiór jest z natury mały (kontakty jednego domku).
  Nie dokładać `?q=` ani `?sort=`; `q` i `sort` w URL-u to stan interfejsu,
  nie zapytanie do API.

---

## 8. Model błędów

```ts
class ContactNotFound extends Schema.TaggedError<ContactNotFound>()(
  "ContactNotFound", { id: ContactId }
) {}
```

Błędy deklarowane per-endpoint w `HttpApi`. Effect wymusza ich obsługę
w sygnaturze handlera, mapuje na statusy i **wpisuje do OpenAPI** — więc
`openapi-typescript` przenosi je na front jako typowaną unię.

| Błąd | HTTP | Reakcja klienta |
|---|---|---|
| walidacja schematu | 400 | błąd przy polu formularza |
| `ContactNotFound` | 404 | toast + `invalidateQueries` (lista nieaktualna) |
| nieobsłużony | 500 | toast "Coś poszło nie tak", szczegóły w logu serwera |

Konsekwencja, która jest tu celem: dodanie nowego błędu na serwerze **psuje
kompilację klienta**, dopóki nie zostanie obsłużony.

---

## 9. Ekran Kontakty

Zachowanie odwzorowane z dostarczonego HTML-a. To specyfikacja, nie sugestia.

### Powłoka
Sidebar 264 px: nazwa domku · `Kontakty` (aktywne) · grupa **Wkrótce** →
`Rezerwacje`, `Finanse`, `Zapytania` (nieaktywne, `aria-disabled`) · stopka:
awatar `SB`, "Szymon Błażyński", "Właściciel". Poniżej 900 px sidebar staje się
poziomym paskiem, grupa "Wkrótce" i stopka znikają.

### Lista
- Kolumny: **Imię i nazwisko** · **Specjalizacja** · **Telefon** · menu
- Sortowanie po kliknięciu nagłówka; ponowne kliknięcie odwraca kierunek.
  `localeCompare(…, "pl")`, remis rozstrzygany po nazwisku. `aria-sort`
  ustawiane na `ascending` / `descending` / `none`.
- Wyszukiwanie obejmuje imię, specjalizację i numer. Zapytanie cyfrowe jest
  normalizowane, więc `"602 118"` znajduje `602118447`.
- Licznik: `24 kontakty` (polska odmiana: 1 → *kontakt*, 2–4 → *kontakty*,
  reszta → *kontaktów*; wyjątek dla końcówek 12–14) albo `3 z 24` przy filtrze.
- Numer wyświetlany jako `602 118 447`, klikalny jako `tel:+48602118447`.
- Stan `query` / `sort` / `dir` żyje w URL-u, walidowany schematem TanStack
  Routera.

### Akcje w wierszu
Menu (`aria-haspopup`): **Kopiuj numer** · **Edytuj** · **Usuń**. Zamykane
`Escape` i kliknięciem poza. Po zamknięciu modala fokus wraca na przycisk, który
go otworzył.

### Formularz
Jeden `<Dialog>` obsługuje dodawanie i edycję — różni je tytuł, podpowiedź
i etykieta przycisku. `Enter` zapisuje, `Escape` zamyka, fokus uwięziony
w modalu.

- Walidacja `onBlur`, ponowna przy zapisie
- Telefon: normalizacja przy zapisie (usunięcie spacji, myślników, `+48`),
  wymagane dziewięć cyfr
- **Ostrzeżenie o duplikacie** — jeśli numer już istnieje, pod polem pojawia się
  *„Ten numer masz już jako Grzegorz Sobczak — Złota rączka"*. To ostrzeżenie,
  nie błąd: zapis przechodzi. Sprawdzane lokalnie, na pobranej liście.

### Usuwanie
`<AlertDialog>` z nazwą i specjalizacją kontaktu. Po potwierdzeniu `DELETE`
leci natychmiast; toast przez 6 s oferuje **Cofnij**, które robi `POST` z tymi
samymi danymi. Kontakt wraca z nowym `id`
([ADR-0003](./adr/0003-twarde-usuwanie-z-cofnij.md)).

### Stany puste
Dwa różne: brak kontaktów w ogóle ("Dodaj pierwszy numer, żeby wiedzieć, do
kogo dzwonić przy awarii") i brak wyników wyszukiwania (z przytoczonym
zapytaniem). Pierwszy prowadzi do dodania, drugi do zmiany filtra.

### react-query
- `queryKey: ["contacts"]`, `staleTime: 5 min` — dane zmienia jedna osoba
- Mutacje **optymistyczne**, z cofnięciem cache przy błędzie i `invalidate`
  w `onSettled`
- Sonner na potwierdzenia; `action` obsługuje "Cofnij"

---

## 10. Uruchomienie lokalne

```bash
docker compose up -d      # Postgres 16
bun install
bun run dev               # serwer :3000, migracje idą na starcie
bun run dev:client        # klient :5173 (proxy /api → :3000)
```

Serwer i klient startują osobnymi komendami — dwie aplikacje, dwa logi, żadnego
orkiestratora procesów przy dwóch procesach.

Dane przykładowe to 24 kontakty z dostarczonego HTML-a — realistyczny zestaw
fachowców, wystarczający do sensownego testowania sortowania i wyszukiwania
z polskimi znakami. Wgrywane osobną komendą, nie migracją.

Konfiguracja przez zmienne środowiskowe, walidowana `effect/Schema` na starcie —
brak zmiennej zatrzymuje serwer natychmiast, z jasnym komunikatem.

**Testy** — trzy szwy, szczegóły w [`docs/specs/0001-kontakty.md`](./specs/0001-kontakty.md):

1. **HTTP** — testy uderzają w działające API z prawdziwym Postgresem
   w kontenerze. Ten szew łapie literówki w surowym SQL-u; bez ORM-a nic innego
   ich nie złapie. Osobne testy repozytorium są zbędne — leżą niżej i pokrywają
   to samo.
2. **Wyrenderowany ekran** — Testing Library z routerem i react-query, sieć
   podstawiona przez MSW. Asercje przez rolę i tekst.
3. **Funkcje czyste** — formatowanie numeru, odmiana liczebnika, porównanie do
   sortowania. Gęste przypadki brzegowe, przez UI testowałoby się je niezgrabnie.

E2E i regresja wizualna odłożone.

---

## 11. Świadomie odłożone

| Temat | Dlaczego teraz nie | Co trzeba będzie ruszyć |
|---|---|---|
| Autoryzacja | jeden użytkownik, uruchamiane lokalnie | **wraca obowiązkowo** przed wystawieniem do internetu |
| Część publiczna | zapowiedziana, ale nie w tej fazie | SSR/SEO — dziś nie ma ich w stacku |
| Wdrożenie na AWS | osobna rozmowa | serwer Effecta stoi na Node; RDS albo Aurora Serverless |
| Rezerwacje, Finanse, Zapytania | kształt nieznany | nowe moduły; struktura jest na to przygotowana |
| Wiele domków | dziś "domek" nie jest bytem | zmiana fundamentu, nie dodanie rekordu |

**Główna hipoteza tego projektu:** Rezerwacje będą potrzebować `daterange`
i wykluczającego ograniczenia w Postgresie. Na tym opiera się wybór bazy
([ADR-0002](./adr/0002-postgres-od-pierwszego-dnia.md)) — jeśli okaże się
fałszywa, ten wybór był przesadą.
