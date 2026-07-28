# Context — Pod Śnieżnikiem

Platforma do obsługi jednego domku na wynajem. Narzędzie wewnętrzne właściciela.

## Glosariusz

### Domek (Cottage)
Pojedyncza nieruchomość na wynajem — "Pod Śnieżnikiem". Platforma obsługuje
**dokładnie jeden** domek. Nazwa domku pojawia się w nagłówku i okruszkach,
ale nie jest bytem, który da się utworzyć, wybrać ani usunąć.

Konsekwencja: nie istnieje pojęcie "wybranego domku". Jeśli kiedyś pojawi się
drugi, jest to zmiana fundamentu, nie dodanie rekordu.

### Właściciel (Owner)
Jedyny użytkownik platformy — Szymon Błażyński. Nie ma logowania, ról ani kont.
Widoczny w interfejsie (stopka nawigacji) jako etykieta, nie jako encja
z tożsamością.

Konsekwencja: żaden zapis nie jest przypisywany do autora. Nie ma "kto to
zmienił", bo odpowiedź jest zawsze ta sama.

### Kontakt (Contact)
Osoba lub firma, do której właściciel dzwoni w sprawach domku — fachowiec,
usługodawca, obsługa. Nie jest to gość ani najemca.

Kontakt ma **imię i nazwisko**, **specjalizację** i **telefon**.

- Tworzenie wymaga wszystkich trzech pól.
- Edycja jest częściowa — pominięte pole zostaje bez zmian. Pola nie mogą być
  puste, więc specjalizacji nie da się wyczyścić, tylko nadpisać.

### Specjalizacja (Specialization)
Czym zajmuje się kontakt — "Hydraulik", "Odśnieżanie", "Księgowa". Swobodny
tekst, nie słownik zamknięty. Jeden kontakt ma dokładnie **jedną**
specjalizację.

Konsekwencja: to etykieta opisowa, nie kategoria. Dwa zapisy o tym samym
znaczeniu ("Hydraulik" / "hydraulik") są różnymi wartościami.

Konsekwencja: osoba wykonująca dwa fachy to **dwa kontakty**, dzielące numer
telefonu. Dlatego numer nie jest unikalny — patrz [[Telefon]].

### Telefon (Phone)
Polski numer komórkowy lub stacjonarny, dziewięć cyfr, bez prefiksu kraju.

Numer jest **jedną wartością o trzech odczytach**:

- **cyfry** — to, co trzyma baza i po czym porównuje się numery,
- **zapis czytelny** — `602 118 447`, dla tabeli i formularza,
- **adres do wybrania numeru** — `tel:+48602118447`.

Wartość powstaje raz, przy odczytaniu tego, co wpisano lub wklejono; dalej się
o nią tylko pyta. Normalizacja dzieje się na wejściu i nigdzie później.

Konsekwencja: numer wpisany ze spacjami, myślnikami lub prefiksem `+48` jest
normalizowany, nie odrzucany. Wyszukiwanie po numerze też ignoruje formatowanie —
ale ma własną regułę, czy zapytanie jest w ogóle pytaniem o numer: samotna cyfra
wśród liter to tekst, nie fragment numeru.

Numer **nie jest unikalny** — jedna osoba może występować jako kilka kontaktów
o różnych specjalizacjach. Powtórzony numer jest ostrzeżeniem w interfejsie,
nie błędem.

### Usunięcie kontaktu (Deletion)
Usunięcie jest natychmiastowe i trwałe. Przez chwilę po nim można je **cofnąć**,
co tworzy kontakt na nowo z tych samych danych — nie przywraca poprzedniego
rekordu.

Konsekwencja: cofnięcie nie jest "odwróceniem operacji", tylko powtórnym
utworzeniem. Kontakt wraca z nową tożsamością. Nie istnieje kontakt "usunięty" —
kontakt albo jest, albo go nie ma.
