# 09 — Edycja kontaktu

**What to build:** ktoś zmienił numer albo firmę — właściciel otwiera menu przy
wierszu, wybiera edycję, widzi formularz wypełniony obecnymi danymi, poprawia
jedno pole i zapisuje. Zmiana jest na liście natychmiast, a tryb edycji jest
wyraźnie odróżniony od dodawania, więc nie da się ich pomylić.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Menu wiersza: kopiowanie numeru, edycja, usunięcie; zapowiedziane dla czytnika ekranu
- [ ] Menu zamyka się Escape'em i kliknięciem obok
- [ ] Aktualizacja jest **częściowa** — pominięte pole zostaje bez zmian; pola nie mogą być puste, więc specjalizacji nie da się wyczyścić, tylko nadpisać
- [ ] Ten sam dialog co przy dodawaniu; różni go tytuł, podpowiedź i etykieta przycisku
- [ ] Znacznik modyfikacji aktualizowany przy zapisie
- [ ] Potwierdzenie zapisania zmian; zmiana widoczna na liście bez odświeżania
- [ ] Nieodnaleziony kontakt: czytelny komunikat i unieważnienie listy (jest nieaktualna)
- [ ] Testy szwu 1: częściowa aktualizacja bez zmiany pominiętego pola, aktualizacja znacznika modyfikacji, aktualizacja nieistniejącego kontaktu
- [ ] Testy szwu 2: edycja z odzwierciedleniem na liście, zamknięcie menu kliknięciem obok, powrót fokusu po zamknięciu okna
