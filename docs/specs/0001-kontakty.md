# Spec 0001 — Kontakty

Pierwsza domena platformy Pod Śnieżnikiem, wraz z fundamentem architektonicznym,
na którym staną kolejne.

Słownik: [`CONTEXT.md`](../../CONTEXT.md) · Architektura: [`docs/DESIGN.md`](../DESIGN.md) ·
Decyzje: [`docs/adr/`](../adr)

---

## Problem Statement

Właściciel domku ma listę fachowców rozsianą po notatkach w telefonie, mailach
i pamięci. Gdy w domku pęka rura albo wysiada piec — zwykle wtedy, gdy w środku
są goście — musi w kilka minut ustalić, do kogo zadzwonić. Szukanie po
kontaktach w telefonie zawodzi, bo nie pamięta nazwiska hydraulika, tylko to,
że kiedyś któryś był. Nie ma jednego miejsca, w którym numer stoi obok
informacji, czym ten człowiek się zajmuje.

Do tego numery żyją: ktoś zmienia firmę, ktoś przestaje odbierać, ktoś polecił
kogoś lepszego. Bez jednego miejsca lista nigdy nie jest aktualna.

## Solution

Ekran **Kontakty** w panelu właściciela: pojedyncza lista fachowców i
usługodawców obsługujących domek, z imieniem, specjalizacją i numerem.

Wyszukiwanie działa po wszystkich trzech polach naraz — wpisanie „hydraulik"
znajduje fachowca, którego nazwiska nie pamiętasz, a wpisanie fragmentu numeru
znajduje osobę, której numer właśnie wyświetlił się na telefonie. Numer można
wybrać jednym kliknięciem albo skopiować. Dodanie, poprawienie i usunięcie
kontaktu zajmuje kilka sekund i nie wymaga potwierdzeń poza tym jednym, które
chroni przed przypadkowym usunięciem — a i to da się cofnąć.

Ekran jest jednocześnie fundamentem: struktura modułów, kontrakt front↔back,
model błędów i warstwa danych powstają tutaj i obowiązują kolejne domeny.

---

## User Stories

### Przeglądanie listy

1. Jako właściciel domku chcę widzieć wszystkie swoje kontakty na jednej liście, żeby nie szukać ich po kilku miejscach.
2. Jako właściciel domku chcę widzieć obok każdego nazwiska jego specjalizację, żeby wiedzieć, w jakiej sprawie do tej osoby dzwonić.
3. Jako właściciel domku chcę widzieć liczbę kontaktów, żeby wiedzieć, jak kompletna jest moja lista.
4. Jako właściciel domku chcę, żeby liczba kontaktów była napisana poprawną polszczyzną („1 kontakt", „3 kontakty", „24 kontakty", „12 kontaktów"), żeby interfejs nie wyglądał na niedokończony.
5. Jako właściciel domku chcę widzieć numery w czytelnym formacie z odstępami, żeby móc je przepisać bez pomyłki.
6. Jako właściciel domku chcę, żeby lista domyślnie była posortowana alfabetycznie po nazwisku, żeby wiedzieć, gdzie czegoś szukać.
7. Jako właściciel domku chcę widzieć czytelny komunikat, gdy lista jest pusta, żeby wiedzieć, że to nie awaria, tylko brak danych.
8. Jako właściciel domku chcę, żeby pusta lista zachęcała do dodania pierwszego kontaktu, żeby wiedzieć, co dalej.

### Wyszukiwanie

9. Jako właściciel domku chcę szukać po nazwisku, żeby szybko znaleźć znaną mi osobę.
10. Jako właściciel domku chcę szukać po specjalizacji, żeby znaleźć fachowca, gdy nie pamiętam nazwiska.
11. Jako właściciel domku chcę szukać po numerze telefonu, żeby rozpoznać, kto do mnie właśnie dzwonił.
12. Jako właściciel domku chcę, żeby wyszukiwanie po numerze ignorowało odstępy i prefiks kierunkowy, żeby wklejony skądkolwiek numer zadziałał.
13. Jako właściciel domku chcę, żeby wyszukiwanie ignorowało wielkość liter, żeby nie zastanawiać się nad pisownią.
14. Jako właściciel domku chcę widzieć, ile wyników pasuje do zapytania na tle całości, żeby wiedzieć, czy filtr jest zbyt wąski.
15. Jako właściciel domku chcę móc wyczyścić zapytanie jednym kliknięciem, żeby szybko wrócić do pełnej listy.
16. Jako właściciel domku chcę widzieć komunikat z przytoczonym zapytaniem, gdy nic nie pasuje, żeby zobaczyć, czego faktycznie szukałem.
17. Jako właściciel domku chcę, żeby wyniki pojawiały się natychmiast podczas pisania, żeby nie czekać na odpowiedź serwera przy każdej literze.

### Sortowanie

18. Jako właściciel domku chcę sortować listę po nazwisku, żeby przeglądać ją alfabetycznie.
19. Jako właściciel domku chcę sortować listę po specjalizacji, żeby zobaczyć wszystkich od jednej dziedziny obok siebie.
20. Jako właściciel domku chcę sortować listę po numerze, żeby wyłapać podejrzanie podobne wpisy.
21. Jako właściciel domku chcę odwrócić kierunek sortowania ponownym kliknięciem nagłówka, żeby nie szukać osobnego przełącznika.
22. Jako właściciel domku chcę widzieć, po której kolumnie i w którą stronę lista jest posortowana, żeby nie zgadywać.
23. Jako właściciel domku chcę, żeby polskie znaki sortowały się poprawnie („Ł" po „L", nie na końcu), żeby porządek był taki, jakiego oczekuję.
24. Jako właściciel domku chcę, żeby przy sortowaniu po specjalizacji osoby z tą samą specjalizacją były ułożone alfabetycznie, żeby kolejność nie skakała.

### Trwałość widoku

25. Jako właściciel domku chcę, żeby odświeżenie strony nie gubiło mojego filtra i sortowania, żeby nie zaczynać od nowa.
26. Jako właściciel domku chcę, żeby przycisk „wstecz" cofał do poprzedniego filtra, żeby poruszać się po widoku naturalnie.
27. Jako właściciel domku chcę móc zapisać w zakładkach albo wysłać sobie link do konkretnego widoku listy, żeby wrócić do niego później.

### Dzwonienie i kopiowanie

28. Jako właściciel domku chcę zadzwonić pod numer jednym kliknięciem, żeby nie przepisywać go do telefonu.
29. Jako właściciel domku chcę skopiować numer do schowka, żeby wkleić go w wiadomość albo inne narzędzie.
30. Jako właściciel domku chcę zobaczyć potwierdzenie, że numer trafił do schowka, żeby nie kopiować drugi raz na wszelki wypadek.
31. Jako właściciel domku chcę, żeby skopiowany numer był w czytelnym formacie, żeby wklejony gdzieś dalej dało się go przeczytać.

### Dodawanie

32. Jako właściciel domku chcę dodać nowy kontakt, żeby lista rosła wraz z tym, kogo poznaję.
33. Jako właściciel domku chcę podać imię, nazwisko, specjalizację i numer, żeby wpis był kompletny od początku.
34. Jako właściciel domku chcę, żeby wszystkie trzy pola były wymagane przy dodawaniu, żeby nie tworzyć wpisów bez wartości.
35. Jako właściciel domku chcę zatwierdzić formularz klawiszem Enter, żeby nie sięgać po mysz.
36. Jako właściciel domku chcę zamknąć formularz klawiszem Escape, żeby szybko się wycofać.
37. Jako właściciel domku chcę wpisać numer w dowolnym formacie — z odstępami, myślnikami albo prefiksem `+48` — żeby nie musieć go ręcznie czyścić.
38. Jako właściciel domku chcę zobaczyć błąd przy konkretnym polu, gdy coś jest nie tak, żeby wiedzieć, co poprawić.
39. Jako właściciel domku chcę, żeby błąd pojawił się dopiero po opuszczeniu pola, a nie przy pierwszej wpisanej literze, żeby formularz nie krzyczał w trakcie pisania.
40. Jako właściciel domku chcę zobaczyć potwierdzenie z nazwiskiem po dodaniu kontaktu, żeby wiedzieć, że się udało.
41. Jako właściciel domku chcę, żeby nowy kontakt od razu pojawił się na liście we właściwym miejscu, żeby nie odświeżać strony.

### Duplikaty

42. Jako właściciel domku chcę zostać ostrzeżony, gdy wpisuję numer, który już mam, żeby nie tworzyć przypadkowego duplikatu.
43. Jako właściciel domku chcę zobaczyć w ostrzeżeniu, do kogo ten numer już należy, żeby ocenić, czy to pomyłka.
44. Jako właściciel domku chcę mimo ostrzeżenia móc zapisać kontakt, żeby dodać drugą specjalizację osoby, która wykonuje dwa fachy.

### Edycja

45. Jako właściciel domku chcę poprawić dane kontaktu, żeby lista pozostawała aktualna, gdy ktoś zmieni numer.
46. Jako właściciel domku chcę zobaczyć formularz edycji wypełniony obecnymi danymi, żeby zmieniać tylko to, co trzeba.
47. Jako właściciel domku chcę, żeby formularz edycji był wyraźnie odróżniony od dodawania tytułem i etykietą przycisku, żeby nie pomylić trybów.
48. Jako właściciel domku chcę zobaczyć potwierdzenie zapisania zmian, żeby wiedzieć, że wersja na liście jest nowa.
49. Jako właściciel domku chcę, żeby zmiana była widoczna na liście natychmiast, żeby nie odświeżać strony.

### Usuwanie i cofanie

50. Jako właściciel domku chcę usunąć nieaktualny kontakt, żeby lista nie puchła od numerów, które nie działają.
51. Jako właściciel domku chcę potwierdzić usunięcie w osobnym oknie, żeby nie skasować czegoś jednym omyłkowym kliknięciem.
52. Jako właściciel domku chcę zobaczyć w potwierdzeniu, kogo dokładnie usuwam, żeby mieć pewność, że to właściwy wpis.
53. Jako właściciel domku chcę móc cofnąć usunięcie przez chwilę po fakcie, żeby naprawić pomyłkę bez wpisywania danych od nowa.
54. Jako właściciel domku chcę, żeby okno na cofnięcie było na tyle długie, żebym zdążył zareagować, ale nie zawadzało w pracy.
55. Jako właściciel domku chcę zobaczyć potwierdzenie przywrócenia kontaktu, żeby wiedzieć, że jest z powrotem.
56. Jako właściciel domku chcę zobaczyć czytelny błąd, jeśli cofnięcie się nie uda, żeby nie zakładać, że kontakt wrócił.

### Nawigacja i powłoka

57. Jako właściciel domku chcę widzieć nazwę swojego domku w interfejsie, żeby aplikacja była moja, a nie anonimowa.
58. Jako właściciel domku chcę widzieć w nawigacji sekcje, które dopiero powstaną, żeby wiedzieć, dokąd to zmierza.
59. Jako właściciel domku chcę, żeby niedostępne sekcje były wyraźnie oznaczone jako niegotowe, żeby nie klikać w nie na próżno.
60. Jako właściciel domku chcę korzystać z panelu na telefonie, żeby znaleźć numer, stojąc przy zepsutym piecu.
61. Jako właściciel domku chcę, żeby na wąskim ekranie lista miała pierwszeństwo przed nawigacją, żeby widzieć to, po co przyszedłem.

### Dostępność i stany brzegowe

62. Jako właściciel domku chcę obsłużyć cały ekran z klawiatury, żeby pracować szybciej.
63. Jako właściciel domku chcę, żeby fokus był zawsze wyraźnie widoczny, żeby wiedzieć, gdzie jestem.
64. Jako właściciel domku chcę, żeby po zamknięciu okna fokus wrócił tam, skąd je otworzyłem, żeby nie szukać miejsca na nowo.
65. Jako właściciel domku chcę, żeby fokus nie uciekał poza otwarte okno, żeby Tab nie wyprowadzał mnie w tło.
66. Jako właściciel domku chcę, żeby Escape zamykał otwarte menu albo okno, żeby wycofać się jednym ruchem.
67. Jako właściciel domku chcę, żeby menu wiersza zamykało się po kliknięciu obok, żeby nie zostawało otwarte przez przypadek.
68. Jako właściciel domku chcę widzieć czytelny komunikat, gdy dane nie chcą się wczytać, żeby wiedzieć, że to problem połączenia, a nie pusta lista.
69. Jako właściciel domku chcę widzieć, że dane się wczytują, żeby nie brać pustego ekranu za brak kontaktów.
70. Jako właściciel domku chcę, żeby animacje ustępowały, gdy mam włączone systemowe ograniczenie ruchu, żeby interfejs mnie nie męczył.

### Fundament (potrzeby wynikające z dalszego rozwoju)

71. Jako właściciel domku chcę, żeby dodanie kolejnej sekcji nie wymagało przebudowy istniejących, żeby platforma rosła bez przepisywania.
72. Jako właściciel domku chcę, żeby dane przeżywały restart aplikacji, żeby lista była trwała.
73. Jako właściciel domku chcę mieć podgląd tego, co API potrafi, żeby móc podpiąć się do niego później z innego miejsca.
74. Jako właściciel domku chcę, żeby aplikacja od razu po uruchomieniu zawierała przykładowe dane, żeby zobaczyć, jak działa, zanim wpiszę własne.

---

## Implementation Decisions

### Struktura i granice

- Repozytorium to **workspace bun** z trzema paczkami: serwer, klient i wspólne
  kontrakty. Granica klient/serwer jest **fizyczna** — przebiega po granicy
  aplikacji, nie po regule lintera. Turborepo świadomie pominięte przy dwóch
  aplikacjach.
- Konwencja modułów przeniesiona z gon-stacka: moduł to folder z warstwami
  `domain` / `configuration` / `integration` / `presentation`, wystawiający
  **wyłącznie barrel `index.ts`**. Import w głąb cudzego modułu blokowany
  lintem. Zależności między warstwami idą w jedną stronę; `domain` nie importuje
  niczego.
- Teksty widoczne dla użytkownika mieszkają w osobnych modułach `copy`, nie
  w JSX. Nie wprowadzamy i18n — interfejs jest po polsku i nie ma planu, żeby
  przestał.
- Powłoka aplikacji (layout, router, klient HTTP, konfiguracja zapytań) mieszka
  w warstwie `core` i nie zawiera logiki domenowej.

### Kontrakt front↔back

- Serwer definiuje API deklaratywnie w `HttpApi` Effecta; z tej definicji
  **wyprowadzany jest OpenAPI** i wystawiany Swagger UI.
- Klient nie importuje kodu serwera. Typy powstają z OpenAPI przez generator,
  są **commitowane do repo** i weryfikowane w CI (regeneracja + `git diff
  --exit-code`) — nieaktualne wywalają build.
- Klient rozmawia z API przez cienki, typowany wrapper na `fetch` (ścieżki
  i odpowiedzi sprawdzane z wygenerowanych typów) opakowany w TanStack Query.
  **Runtime Effecta nie trafia do przeglądarki** — z paczki kontraktów wolno
  brać wyłącznie typy.
- Zod **nie uczestniczy** w kontrakcie API. Opisuje wyłącznie formularz.
  Powiązanie trzyma asercja typowa porównująca **wyjście** schematu zoda (stan
  po transformacji) z typem żądania z OpenAPI — rozjazd jest błędem kompilacji.
  Uzasadnienie: [ADR-0001](../adr/0001-effect-na-serwerze-zod-na-froncie.md).

### Model danych

- **PostgreSQL od pierwszego dnia**, surowy SQL, bez ORM-a. Uzasadnienie
  i konsekwencje: [ADR-0002](../adr/0002-postgres-od-pierwszego-dnia.md).
- Migracje jako ponumerowane pliki uruchamiane na starcie serwera.
- Kontakt ma identyfikator (UUID), imię i nazwisko, specjalizację, numer oraz
  znaczniki utworzenia i modyfikacji.
- Numer przechowywany jako **dziewięć cyfr**, bez prefiksu i formatowania.
  Normalizacja odbywa się w formularzu; baza waliduje wynik ograniczeniem.
- **Brak unikalności numeru.** Jedna osoba wykonująca dwa fachy to dwa kontakty
  o tym samym numerze — wynika to wprost z tego, że kontakt ma dokładnie jedną
  specjalizację.
- **Brak kolumn `deleted_at` i `created_by`** — usuwanie jest trwałe, a autor
  zawsze ten sam.
- Sortowanie **nie odbywa się w SQL-u**. Indeks na nazwisku daje tylko domyślny,
  przewidywalny porządek odpowiedzi.

### API

- Cztery operacje na kolekcji kontaktów: pobranie listy, utworzenie, częściowa
  aktualizacja, usunięcie.
- **Pobranie zwraca komplet, bez parametrów.** Filtrowanie i sortowanie są po
  stronie klienta — zbiór jest z natury mały (kontakty jednego domku, kilkadziesiąt
  rekordów). To decyzja świadoma, nie niedopatrzenie: `q` i `sort` w adresie to
  stan interfejsu, nie zapytanie do API. Nie dokładać parametrów do endpointu.
- **Tworzenie wymaga kompletu** trzech pól. **Aktualizacja jest częściowa** —
  pominięte pole zostaje bez zmian. Ponieważ pola nie mogą być puste, raz
  ustawionej specjalizacji nie da się wyczyścić, tylko nadpisać. Świadome
  uproszczenie MVP.

Kształt danych, bo precyzyjniej niż prozą (schemat serwera):

```
Contact          = { id, name, role, phone, createdAt, updatedAt }
CreateContactBody = Contact bez id i znaczników  — wszystkie pola wymagane
UpdateContactBody = CreateContactBody, wszystkie pola opcjonalne
```

Ograniczenia: `name` 1–100 znaków po przycięciu, `role` 1–60, `phone` dokładnie
dziewięć cyfr.

### Błędy

- Błędy domenowe są **nazwane i deklarowane per-endpoint**. Effect wymusza ich
  obsługę w sygnaturze, mapuje na statusy HTTP i wpisuje do OpenAPI — więc
  docierają na front jako **typowana unia**.
- Konsekwencja, która jest celem: dodanie nowego błędu na serwerze **psuje
  kompilację klienta**, dopóki nie zostanie obsłużony.
- W MVP jeden błąd domenowy: nieodnaleziony kontakt (404). Walidacja schematu to
  400, reszta 500 z komunikatem ogólnym i szczegółami wyłącznie w logu serwera.
- Klient reaguje: 400 → błąd przy polu formularza, 404 → komunikat
  + unieważnienie listy (jest nieaktualna), 500 → komunikat ogólny.

### Klient

- Routing z otypowanymi i **walidowanymi schematem** parametrami adresu. Filtr
  i sortowanie żyją w adresie, nie w stanie komponentu — dzięki temu działa
  „wstecz", odświeżenie i link.
- Jedno zapytanie o listę z długim czasem świeżości; dane zmienia jedna osoba.
- Mutacje **optymistyczne**, z cofnięciem cache przy błędzie i unieważnieniem
  po zakończeniu.
- Tabela to prymityw shadcn plus własne sortowanie porównaniem z polską lokalizacją,
  z remisem rozstrzyganym po nazwisku. Biblioteka do tabel świadomie pominięta —
  trzy kolumny, jedno sortowanie, brak paginacji serwerowej.
- **Jeden dialog obsługuje dodawanie i edycję**; różnią je tytuł, podpowiedź
  i etykieta przycisku. Usuwanie ma osobny dialog ostrzegawczy.
- Ostrzeżenie o duplikacie numeru liczone **lokalnie**, na pobranej liście —
  bez dodatkowego zapytania. Jest ostrzeżeniem, nie błędem: zapis przechodzi.
- Powiadomienia (dodano, zapisano, skopiowano, usunięto) przez bibliotekę
  toastów wspierającą akcję w treści — na niej opiera się „Cofnij".
- Design tokeny z dostarczonego projektu (paleta, typografia, promienie,
  siatka powłoki) wchodzą jako motyw Tailwinda, dzięki czemu shadcn dziedziczy
  je zamiast domyślnych. Fonty **hostowane lokalnie**, nie z Google Fonts.
- Poniżej progu wąskiego ekranu sidebar staje się poziomym paskiem; grupa
  sekcji nadchodzących i stopka znikają.

### Usuwanie

- Usunięcie leci **natychmiast i jest trwałe**. „Cofnij" wysyła żądanie
  utworzenia z zapamiętanych danych — kontakt wraca z **nowym identyfikatorem**.
  Nie jest to odwrócenie operacji, tylko powtórne utworzenie.
- Odrzucono miękkie usuwanie (zanieczyszcza każde zapytanie, rozwiązuje problem
  audytu, którego nie ma) i odroczone usuwanie (rekord przez okno cofnięcia nadal
  jest w bazie, więc powrót na ekran go wskrzesza).
- Pełne uzasadnienie i warunek unieważnienia decyzji:
  [ADR-0003](../adr/0003-twarde-usuwanie-z-cofnij.md).

### Uruchomienie

- Postgres w kontenerze; instalacja, migracja, start jako trzy komendy.
- Konfiguracja przez zmienne środowiskowe, **walidowana schematem na starcie** —
  brak zmiennej zatrzymuje serwer natychmiast, z jasnym komunikatem, zamiast
  wywalić się później na pierwszym zapytaniu.
- Dane przykładowe: 24 kontakty z dostarczonego projektu. Wgrywane **osobną
  komendą, nie migracją** — migracje opisują schemat, nie treść.

---

## Testing Decisions

### Co jest dobrym testem

Test opisuje **zachowanie widoczne z zewnątrz**, nie sposób jego osiągnięcia.
Konkretnie w tym projekcie:

- Test klienta szuka elementów **po roli i widocznym tekście**, tak jak robi to
  użytkownik — nigdy po klasach CSS, nazwach komponentów ani atrybutach
  testowych dodanych wyłącznie dla testu.
- Test serwera sprawdza **status i treść odpowiedzi oraz stan bazy po operacji**
  — nigdy tego, jaka funkcja została wywołana ani ile razy.
- Nazwa testu opisuje regułę biznesową („nie pozwala utworzyć kontaktu bez
  specjalizacji"), nie mechanikę („zwraca 400").
- Test, który trzeba poprawić po refaktoryzacji nie zmieniającej zachowania,
  jest testem złym i podlega przepisaniu.

### Szwy

Repozytorium jest puste, więc szwów istniejących nie ma — poniższe są ustalane
teraz i mają obowiązywać kolejne domeny.

**Szew 1 — HTTP.** Testy uderzają w działające API z **prawdziwym Postgresem
w kontenerze**, asercje na odpowiedzi i na stanie bazy. Jeden szew pokrywa
handlery, schematy, repozytorium i SQL. Osobne testy repozytorium są **zbędne** —
ten szew i tak przechodzi przez prawdziwą bazę, a leży wyżej. To doprecyzowanie
`DESIGN.md`; wymóg [ADR-0002](../adr/0002-postgres-od-pierwszego-dnia.md) mówił
o testach na prawdziwej bazie, nie o testach repozytorium, więc jest spełniony.

Pokrywa: utworzenie kompletnego kontaktu · odrzucenie niekompletnego · odrzucenie
numeru o złej długości · przycinanie białych znaków · częściową aktualizację
(pominięte pole bez zmian) · aktualizację i usunięcie nieistniejącego kontaktu ·
dopuszczenie **dwóch kontaktów o tym samym numerze** · aktualizację znacznika
modyfikacji · trwałość usunięcia · odtworzenie kontaktu po usunięciu **z nowym
identyfikatorem**.

**Szew 2 — wyrenderowany ekran.** Testing Library renderuje ekran Kontaktów wraz
z routerem i warstwą zapytań; API podstawiane przez serwer podszywający się pod
sieć (nie przez atrapy modułów). Asercje przez rolę i tekst.

Pokrywa: wyświetlenie listy i licznika · odmianę liczebnika · sortowanie po
każdej kolumnie i odwracanie kierunku · komunikat o kierunku sortowania dla
czytnika ekranu · wyszukiwanie po każdym z trzech pól · wyszukiwanie po numerze
mimo odstępów · czyszczenie zapytania · oba stany puste · odczytanie filtra
i sortowania **z adresu przy wejściu** i zapisanie ich przy zmianie · dodanie,
edycję i usunięcie wraz z odzwierciedleniem na liście · walidację pól
i moment jej wystąpienia · normalizację numeru przy zapisie · ostrzeżenie
o duplikacie **nieblokujące zapisu** · potwierdzenia · cofnięcie usunięcia ·
zamykanie klawiszem Escape · powrót fokusu po zamknięciu okna · uwięzienie
fokusu w oknie · zamknięcie menu kliknięciem obok · stan ładowania i stan błędu
sieci.

**Szew 3 — funkcje czyste.** Formatowanie i normalizacja numeru, odmiana
liczebnika, porównanie do sortowania. Testowalne przez szew 2, ale mają gęste
przypadki brzegowe (polskie znaki, końcówki 12–14, numery o nietypowej
długości), których przez interfejs nie da się przejść zgrabnie.

### Czego nie testujemy

- Prymitywów shadcn — to kod biblioteki.
- Warstw pośrednich modułu w oderwaniu (osobne testy repozytorium, handlerów,
  hooków). Wchodzą przez szwy 1 i 2.
- Wyglądu. Testy regresji wizualnej odłożone razem z E2E.

### Narzędzia

Runner i asercje wbudowane w bun. Testing Library do szwu 2. Kontener
z Postgresem podnoszony na czas szwu 1. Playwright **nie wchodzi w tym specu** —
przy jednym ekranie nie ma czego przeklikiwać end-to-end, a szwy 1 i 2 pokrywają
zachowanie taniej i stabilniej.

---

## Out of Scope

- **Autoryzacja i logowanie.** Jeden użytkownik, uruchamiane lokalnie. Wraca
  **obowiązkowo** przed wystawieniem czegokolwiek do internetu — to nie jest
  „nice to have".
- **Część publiczna** — strona domku, kalendarz wolnych terminów, formularz
  zapytania. Zapowiedziana, ale nie w tej fazie. Dzisiejszy stack nie ma SSR ani
  SEO.
- **Rezerwacje, Finanse, Zapytania.** W nawigacji jako nieaktywne pozycje
  „Wkrótce", bez ekranów. Ich kształt nie jest jeszcze znany — architektura ma
  je przyjąć, nie zgadywać.
- **Wdrożenie na AWS.** Osobna rozmowa.
- **Wiele domków.** Dziś domek nie jest bytem, tylko nazwą w nagłówku. Drugi
  domek to zmiana fundamentu, nie dodanie rekordu.
- **Import kontaktów** z telefonu, pliku czy CSV. Dwadzieścia kilka wpisów
  przepisuje się szybciej, niż buduje import.
- **Wiele specjalizacji na kontakt.** Kontakt ma dokładnie jedną; osoba z dwoma
  fachami to dwa kontakty. Zmiana tego pociąga model, formularz i unikalność
  numeru.
- **Notatki, adresy, e-maile, załączniki, oceny fachowców, historia zleceń.**
  Kontakt to nazwisko, fach i numer.
- **Grupowanie po specjalizacji, ulubione, tagi.** Sortowanie po specjalizacji
  wystarcza przy tej skali.
- **Historia zmian i audyt.** Jeden użytkownik, odpowiedź na „kto to zmienił"
  jest zawsze ta sama.
- **Praca offline, PWA, powiadomienia.**
- **i18n.** Interfejs jest po polsku.
- **Testy E2E i regresji wizualnej.**

---

## Further Notes

**Ten spec ustanawia wzorce.** Kontakty są domeną celowo tanią — trzy pola, brak
reguł czasowych, brak powiązań. To sprawia, że są dobrym miejscem na ustalenie
struktury modułów, kontraktu, modelu błędów i szwów testowych, zanim zderzy się
to z Rezerwacjami, gdzie każda pomyłka kosztuje więcej. Rozstrzygnięcia z sekcji
*Implementation* i *Testing* należy traktować jako obowiązujące dalej, nie jako
lokalne dla tego ekranu.

**Główna hipoteza projektu** brzmi: Rezerwacje będą potrzebować typu zakresu dat
i wykluczającego ograniczenia w bazie. Na tym opiera się wybór Postgresa nad
prostszym SQLite. Jeśli hipoteza okaże się fałszywa, ten wybór był przesadą —
warto to sprawdzić przy projektowaniu Rezerwacji, zanim koszt się utrwali.

**Trzy decyzje odbiegają od dostarczonego projektu HTML** i są celowe:
- specjalizacja jest **wymagana przy tworzeniu**, podczas gdy prototyp podstawiał
  „Bez kategorii" — teksty w oknie formularza wymagają przepisania, bo obecne
  („Wystarczy imię i numer") przestały być prawdziwe;
- edycja jest **częściowa**, czego prototyp nie rozróżniał, bo trzymał wszystko
  w stanie komponentu;
- filtr i sortowanie żyją **w adresie**, nie w stanie komponentu.

**Warunek unieważnienia [ADR-0003](../adr/0003-twarde-usuwanie-z-cofnij.md):**
gdy inna domena zacznie wskazywać na kontakt (rezerwacja przypisana do
sprzątaczki, faktura powiązana z wykonawcą), założenie „identyfikator nigdzie nie
jest referencjonowany" przestanie obowiązywać i decyzję o twardym usuwaniu trzeba
będzie przemyśleć na nowo. To najbardziej prawdopodobny punkt, w którym ten spec
się zestarzeje.

**Ryzyko wygenerowanych typów:** plik z typami z OpenAPI jest commitowany
i weryfikowany w CI. Jeśli weryfikacja okaże się uciążliwa i ktoś ją wyłączy,
cały łańcuch bezpieczeństwa typów między serwerem a klientem przestaje działać
po cichu — kompilacja nadal przechodzi, tylko na nieaktualnym kontrakcie.
