# 05 — Przeglądanie listy: format, licznik, sortowanie, wyszukiwanie

**What to build:** lista staje się użyteczna. Właściciel widzi, ilu ma kontaktów
(poprawną polszczyzną), czyta numery w czytelnym formacie i dzwoni jednym
kliknięciem albo kopiuje numer do schowka. Klika nagłówek, żeby posortować,
i wpisuje cokolwiek — nazwisko, fach albo fragment numeru — żeby zawęzić listę
natychmiast, bez czekania na serwer. Filtr i sortowanie żyją w adresie, więc
odświeżenie, „wstecz" i wysłany sobie link odtwarzają dokładnie ten widok.

Scalone świadomie: formatowanie, sortowanie i filtrowanie dzielą jeden stan
widoku i jedną funkcję wyliczającą wiersze — rozdzielenie ich na trzy tickety
oznaczałoby trzykrotne przepisywanie tego samego miejsca.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Numer wyświetlany z odstępami; wybieranie numeru jednym kliknięciem; kopiowanie do schowka w czytelnym formacie, z potwierdzeniem
- [ ] Licznik odmieniony poprawnie (1 → kontakt, 2–4 → kontakty, reszta → kontaktów, wyjątek dla końcówek 12–14); przy filtrze pokazuje wynik na tle całości
- [ ] Sortowanie po każdej z trzech kolumn, ponowne kliknięcie odwraca kierunek; kierunek widoczny wizualnie i dla czytnika ekranu
- [ ] Porządek zgodny z polską lokalizacją („Ł" po „L"), remis rozstrzygany po nazwisku; domyślnie alfabetycznie po nazwisku
- [ ] Wyszukiwanie obejmuje imię, specjalizację i numer naraz, ignoruje wielkość liter
- [ ] Zapytanie cyfrowe ignoruje odstępy, myślniki i prefiks kierunkowy
- [ ] Wyniki pojawiają się w trakcie pisania — bez zapytania do API; endpoint nadal nie przyjmuje parametrów
- [ ] Zapytanie da się wyczyścić jednym kliknięciem
- [ ] Filtr i sortowanie czytane z adresu przy wejściu i zapisywane przy zmianie; parametry walidowane schematem
- [ ] Testy szwu 3 dla funkcji czystych: formatowanie i normalizacja numeru, odmiana liczebnika, porównanie do sortowania (polskie znaki, końcówki 12–14, nietypowe długości)
- [ ] Testy szwu 2: sortowanie każdej kolumny i odwracanie, wyszukiwanie po każdym z trzech pól, wyszukiwanie po numerze mimo odstępów, czyszczenie, odczyt i zapis stanu w adresie
