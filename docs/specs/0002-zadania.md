# Spec 0002 — Zadania

Druga domena platformy Pod Śnieżnikiem. Buduje na fundamencie ustalonym przez
[Spec 0001 — Kontakty](0001-kontakty.md) (struktura modułów, kontrakt
front↔back, model błędów, wzorzec usuwania z cofnięciem) — ten spec opisuje
tylko to, co jest specyficzne dla Zadań.

Słownik: [`CONTEXT.md`](../../CONTEXT.md) · Architektura: [`docs/DESIGN.md`](../DESIGN.md) ·
Decyzje: [`docs/adr/`](../adr)

---

## Problem Statement

Właściciel domku ma sprawy, które wracają w czasie — coroczne ubezpieczenie,
comiesięczna faktura do księgowej, sezonowe przeglądy — obok spraw
jednorazowych z konkretnym terminem. Dziś pamięta o nich sam albo zapisuje je
gdzie indziej (kalendarz telefonu, karteczka), co obciąża pamięć i prowadzi do
przeoczeń. Najbardziej zawodne są sprawy roczne: między jednym wystąpieniem
a drugim mija tyle czasu, że łatwo o nich zapomnieć.

## Solution

Ekran **Zadania**: lista spraw związanych z domkiem, każda z opisem i regułą
mówiącą, kiedy przypada. Zadanie jednorazowe ma jedną konkretną datę.
Zadanie cykliczne (co tydzień / co miesiąc / co rok / co N dni-tygodni-miesięcy)
odnawia się samo według reguły — nie trzeba ręcznie tworzyć kolejnych wpisów,
a termin liczy się wg kalendarza niezależnie od tego, czy poprzednie
wystąpienie zostało oznaczone jako zrobione.

Zadania z minionym terminem są widoczne i wyróżnione jako zaległe — nie
znikają same. Oznaczenie „zrobione" chowa zadanie do kolejnego wystąpienia
(dla cyklicznych) albo na stałe (dla jednorazowych). To wyłącznie stan
widoczności — system nie wykonuje żadnej akcji automatycznie; wysyłkę maila,
telefon czy przelew właściciel nadal robi sam, poza aplikacją.

Automatyczne wykonywanie akcji (wysyłka maila, wiadomości) i dodawanie zadań
przez agenta rozumiejącego język naturalny to świadomie osobne, przyszłe
projekty — patrz [Further Notes](#further-notes).

---

## User Stories

### Przeglądanie listy

1. Jako właściciel domku chcę widzieć wszystkie zadania na jednej liście, żeby nie trzymać ich w pamięci.
2. Jako właściciel domku chcę widzieć przy każdym zadaniu, kiedy przypada jego najbliższy termin, żeby wiedzieć, na kiedy się szykować.
3. Jako właściciel domku chcę, żeby zadania z minionym terminem były wyraźnie wyróżnione jako zaległe, żeby ich nie przeoczyć.
4. Jako właściciel domku chcę, żeby lista była posortowana od najbliższego terminu, żeby widzieć najpilniejsze sprawy na górze.
5. Jako właściciel domku chcę widzieć czytelny komunikat, gdy lista jest pusta, żeby wiedzieć, że to brak danych, nie awaria.
6. Jako właściciel domku chcę, żeby pusta lista zachęcała do dodania pierwszego zadania, żeby wiedzieć, co dalej.
7. Jako właściciel domku chcę widzieć, jaki rodzaj cykliczności ma zadanie (raz / co tydzień / co miesiąc / co rok / co N), żeby rozumieć, dlaczego termin wypada akurat wtedy.

### Dodawanie i cykliczność

8. Jako właściciel domku chcę dodać zadanie jednorazowe z konkretną datą, żeby zapisać pojedynczą sprawę.
9. Jako właściciel domku chcę dodać zadanie cykliczne co tydzień, wskazując dzień tygodnia, żeby pilnować cotygodniowych obowiązków.
10. Jako właściciel domku chcę dodać zadanie cykliczne co miesiąc, wskazując dzień miesiąca, żeby pilnować spraw miesięcznych (np. faktura na początku miesiąca).
11. Jako właściciel domku chcę dodać zadanie cykliczne co rok, wskazując dzień i miesiąc, żeby nie zapomnieć o sprawach rocznych (np. ubezpieczenie 17 listopada).
12. Jako właściciel domku chcę dodać zadanie z dowolnym interwałem (co N dni/tygodni/miesięcy), żeby obsłużyć rytm, który nie pasuje do gotowych wzorców.
13. Jako właściciel domku chcę opisać zadanie własnymi słowami, żeby wiedzieć, o co dokładnie chodzi, gdy przypomnienie się pojawi.
14. Jako właściciel domku chcę, żeby formularz pokazywał tylko pola pasujące do wybranego rodzaju cykliczności, żeby nie gubić się w zbędnych opcjach.
15. Jako właściciel domku chcę zobaczyć błąd przy konkretnym polu, gdy coś jest nie tak (np. dzień miesiąca poza zakresem), żeby wiedzieć, co poprawić.
16. Jako właściciel domku chcę zatwierdzić formularz klawiszem Enter i zamknąć Escape, żeby nie sięgać po mysz.
17. Jako właściciel domku chcę zobaczyć potwierdzenie po dodaniu zadania, żeby wiedzieć, że się udało.
18. Jako właściciel domku chcę, żeby nowe zadanie od razu pojawiło się na liście we właściwym miejscu, żeby nie odświeżać strony.

### Oznaczanie jako zrobione

19. Jako właściciel domku chcę oznaczyć zadanie jako zrobione, żeby zniknęło z listy aktywnych spraw.
20. Jako właściciel domku chcę, żeby zadanie cykliczne oznaczone jako zrobione wróciło samo na listę, gdy nadejdzie kolejne wystąpienie, żeby nie musieć go dodawać ponownie.
21. Jako właściciel domku chcę, żeby zadanie jednorazowe oznaczone jako zrobione zniknęło z listy na stałe, żeby lista nie puchła od spraw zamkniętych.
22. Jako właściciel domku chcę móc cofnąć oznaczenie „zrobione" przez chwilę po fakcie, żeby naprawić pomyłkowe kliknięcie.

### Edycja

23. Jako właściciel domku chcę poprawić opis lub regułę zadania, żeby lista pozostawała aktualna, gdy coś się zmieni.
24. Jako właściciel domku chcę zobaczyć formularz edycji wypełniony obecnymi danymi, żeby zmieniać tylko to, co trzeba.
25. Jako właściciel domku chcę, żeby zmiana była widoczna na liście natychmiast, żeby nie odświeżać strony.

### Usuwanie

26. Jako właściciel domku chcę usunąć zadanie, które przestało mieć sens, żeby lista nie zbierała nieaktualnych spraw.
27. Jako właściciel domku chcę potwierdzić usunięcie w osobnym oknie, żeby nie skasować czegoś jednym omyłkowym kliknięciem.
28. Jako właściciel domku chcę móc cofnąć usunięcie przez chwilę po fakcie, żeby naprawić pomyłkę bez wpisywania danych od nowa.

### Nawigacja, dostępność i stany brzegowe

29. Jako właściciel domku chcę widzieć „Zadania" w nawigacji obok „Kontaktów", jako gotową sekcję, nie „Wkrótce".
30. Jako właściciel domku chcę korzystać z ekranu na telefonie, żeby sprawdzić zadania będąc poza domem.
31. Jako właściciel domku chcę obsłużyć cały ekran z klawiatury, z widocznym fokusem, tak jak działa to na ekranie Kontaktów.
32. Jako właściciel domku chcę widzieć czytelny komunikat, gdy dane nie chcą się wczytać, żeby wiedzieć, że to problem połączenia.

---

## Implementation Decisions

### Wspólne z Kontaktami

Moduł `tasks` (serwer i klient) powstaje w tej samej strukturze warstw
(`domain` / `configuration` / `integration` / `presentation`), z tym samym
kontraktem OpenAPI generowanym z `HttpApi`, tym samym modelem błędów
(nazwane błędy domenowe w sygnaturze, 400/404/500) i tym samym wzorcem
twardego usuwania z cofnięciem przez toast (patrz
[ADR-0003](../adr/0003-twarde-usuwanie-z-cofnij.md)) — dotyczy usuwania
zadania, nie oznaczania „zrobione". Teksty w `copy.ts`, bez i18n.

### Model danych

```
Recurrence =
  | { type: "once",    date: string }                                    // YYYY-MM-DD
  | { type: "weekly",  weekday: 1..7 }                                   // 1 = poniedziałek
  | { type: "monthly", dayOfMonth: 1..31 }
  | { type: "yearly",  month: 1..12, day: 1..31 }
  | { type: "custom",  intervalValue: number ≥ 1, intervalUnit: "days"|"weeks"|"months", anchorDate: string }

Task = { id, description, recurrence, completedThrough: string | null, createdAt, updatedAt }
```

- `description`: 1–200 znaków po przycięciu.
- `dayOfMonth` / `day` (yearly) wykraczający poza długość danego miesiąca jest
  **przycinany do ostatniego dnia tego miesiąca** (31 dla lutego → 28 albo 29).
  To samo dotyczy 29 lutego w `yearly` w latach nieprzestępnych.
- `completedThrough` przechowuje datę wystąpienia, które właściciel potwierdził
  jako zrobione — nie datę kliknięcia. Dla zadań jednorazowych to jedyne
  wystąpienie, jakie kiedykolwiek istnieje.
- Tabela `tasks` powstaje migracją, analogicznie do `contacts`.

### Wyznaczanie bieżącego wystąpienia

Termin **nie jest przechowywany** — serwer wylicza go przy każdym odczycie
z reguły `recurrence` względem bieżącej daty. Czysta funkcja domenowa
(`domain/recurrence.ts` po stronie serwera) zwraca **bieżące wystąpienie**:
najpóźniejszą datę wynikającą z reguły, która nie jest późniejsza niż dziś —
to ono jest terminem widocznym na liście, niezależnie od tego, czy minęło.

- `custom`: wystąpienie = `anchorDate + k × interval`, dla największego `k`
  takiego, że wynik ≤ dziś. Jednostka `months` liczy miesiące kalendarzowe
  (jak `monthly`), nie 30-dniowe okresy.
- API dołącza do każdego zadania w odpowiedzi pola wyliczone w locie:
  `dueDate` (bieżące wystąpienie), `overdue` (`dueDate < dziś`), `done`
  (`completedThrough === dueDate`). Klient ich nie liczy — to zapobiega
  rozjazdowi przy różnicy stref czasowych/zegarów.
- Zegar serwera dostępny przez `Clock` z Effecta — w testach podmieniany na
  `TestClock`, żeby sterować „dziś" bez realnego upływu czasu.

### API

Sześć operacji: lista, utworzenie, częściowa aktualizacja (opis i/lub reguła —
ten sam wzorzec co w Kontaktach), usunięcie, **oznacz jako zrobione**,
**cofnij oznaczenie**.

- `POST /tasks/{id}/complete` — bez treści żądania. Serwer sam wylicza bieżące
  wystąpienie i zapisuje je jako `completedThrough`. Celowo nie przyjmuje daty
  od klienta: to działanie referencyjne do serwerowego „dziś", nie edycja pola.
- `POST /tasks/{id}/uncomplete` — przywraca poprzednią wartość
  `completedThrough` (analogicznie do cofnięcia usunięcia — okno czasowe na
  reakcję, taki sam mechanizm toastu z akcją co gdzie indziej w aplikacji).
- Podobnie jak w Kontaktach: **pobranie zwraca komplet**, bez parametrów;
  sortowanie po `dueDate` odbywa się po stronie klienta.

### Klient

- Ekran analogiczny do Kontaktów: jedna tabela/lista, mutacje optymistyczne,
  toasty z akcją „Cofnij" dla usunięcia i dla oznaczenia „zrobione".
- Formularz dodawania/edycji: pole opisu + wybór rodzaju cykliczności, pod
  nim pola warunkowe zależne od wyboru (data / dzień tygodnia / dzień
  miesiąca / dzień+miesiąc / interwał+jednostka+data startowa). Jeden dialog
  dla dodawania i edycji, jak w Kontaktach.
- Zadania przeterminowane (`overdue: true`) wyróżnione wizualnie (badge/kolor),
  reszta w kolejności `dueDate` rosnąco.

---

## Testing Decisions

Te same zasady „co jest dobrym testem" co w [Spec 0001](0001-kontakty.md#co-jest-dobrym-testem):
zachowanie widoczne z zewnątrz, nazwa testu opisuje regułę biznesową.

**Szew 1 — HTTP**, z prawdziwym Postgresem i sterowalnym `TestClock`. Pokrywa:
utworzenie każdego rodzaju cykliczności · odrzucenie nieprawidłowych wartości
(dzień tygodnia poza 1–7, dzień miesiąca poza 1–31, interwał < 1) · częściową
aktualizację · usunięcie i cofnięcie z nowym identyfikatorem · oznaczenie
„zrobione" ustawiające `completedThrough` na bieżące wystąpienie · zniknięcie
z aktywnych po oznaczeniu i powrót po przesunięciu zegara do kolejnego
wystąpienia · cofnięcie oznaczenia · wyliczanie `dueDate`/`overdue`/`done` dla
różnych ustawień zegara względem reguły.

**Szew 2 — wyrenderowany ekran**, Testing Library + serwer podszywający się
pod sieć, asercje przez rolę i tekst. Pokrywa: listę i pusty stan · wyróżnienie
zaległych · dodanie każdego rodzaju cykliczności z właściwymi polami
warunkowymi w formularzu · walidację i moment jej pojawienia się · edycję ·
usunięcie i cofnięcie · oznaczenie „zrobione" i jego cofnięcie · stany
ładowania i błędu sieci.

**Szew 3 — funkcje czyste.** `domain/recurrence.ts`: gęste przypadki brzegowe
— 31. dzień miesiąca w lutym (zwykłym i przestępnym), 29 lutego w `yearly`
w roku nieprzestępnym, przejście roku dla `yearly` i `custom`, `custom` co
N miesięcy z datą startową 31. dnia miesiąca.

### Czego nie testujemy

Jak w Kontaktach: prymitywów shadcn, warstw pośrednich w oderwaniu, wyglądu.

---

## Out of Scope

- **Automatyczne wykonywanie akcji** (wysyłka maila, WhatsApp, SMS). Zadanie
  tylko przypomina — akcję zawsze wykonuje właściciel. Osobny, przyszły
  projekt.
- **Agent/NLP** — dodawanie zadań przez opisanie ich językiem naturalnym
  („przypomnij mi raz w tygodniu o..."). Osobny, przyszły projekt; ten spec
  dostarcza mechanizm, na którym taki agent mógłby operować, ale nie zawiera
  parsera ani integracji z modelem.
- **Powiadomienia poza aplikacją** (mail, push, SMS). Zadanie widać dopiero po
  wejściu na ekran.
- **Powiązanie zadania z Kontaktem** (np. „wyślij fakturę" wskazujące na
  konkretną księgową). Na razie opis to wolny tekst.
- **Archiwum/podgląd zadań jednorazowych oznaczonych jako zrobione.** Znikają
  z widoku aktywnych; rekord zostaje w bazie, ale nie ma dla niego ekranu.
- **Odkładanie/snooze terminu** bez oznaczania jako zrobione.
- **Priorytety, kategorie, tagi.**
- **Historia i audyt** (kto/kiedy oznaczył, kto edytował) — jeden użytkownik.
- **Strefy czasowe.** Daty kalendarzowe bez godziny, jeden serwer, jeden
  użytkownik.
- **Wiele domków.**

---

## Further Notes

**Ten spec celowo zatrzymuje się na przypominaniu, nie na działaniu.** Cel
końcowy właściciela — automatyczna wysyłka faktury, wiadomość do gościa,
agent rozumiejący polecenia w języku naturalnym — wymaga integracji (poczta,
WhatsApp, model językowy), z których każda ma własne pytania o
uwierzytelnienie, obsługę błędów dostawy i koszt. Budowanie ich razem z samym
mechanizmem harmonogramu zamazałoby granicę między „silnikiem, który wie,
kiedy coś przypada" a „integracjami, które coś z tym robią". Ten spec
dostarcza pierwszy, żeby drugi dało się budować na stabilnym gruncie.

**Warunek unieważnienia:** jeśli agent/NLP z Further Notes zacznie zapisywać
zadania bezpośrednio (z pominięciem formularza), pola walidacyjne opisane
w tym specu (długość opisu, zakresy dat) muszą i tak obowiązywać na wejściu do
API — to bramka, którą agent też będzie musiał przejść, nie coś, co go
omija.

**Punkt, w którym ten spec może się zestarzeć:** jeśli kiedyś zadanie zacznie
wskazywać na Kontakt (patrz Out of Scope), twarde usuwanie Kontaktu przestanie
być bezpieczne — to samo ostrzeżenie, które [Spec 0001](0001-kontakty.md#further-notes)
już zawiera dla warunku unieważnienia [ADR-0003](../adr/0003-twarde-usuwanie-z-cofnij.md).
