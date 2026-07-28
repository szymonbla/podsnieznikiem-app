# 02 — Jeden moduł zapisu optymistycznego

**What to build:** Dodanie, edycja i usunięcie kontaktu widać na liście
natychmiast, a nieudany zapis cofa listę do stanu sprzed podglądu — tak jak dziś.
Różnica jest w tym, że ta obietnica jest opisana **raz**, a nie osobno przy
każdym z trzech zapisów.

Dziś każdy zapis powtarza tę samą receptę: anuluj zapytania w locie, zapamiętaj
listę, pokaż podgląd, przy błędzie przywróć, na koniec unieważnij — oraz to samo
tłumaczenie odpowiedzi błędnej na błędy pól i komunikat ogólny. Powtórzenie
znaczy, że błąd w cofaniu może istnieć w jednym zapisie i nie istnieć w dwóch
pozostałych, a dziś **żaden test nie sprawdza cofania**.

Po zmianie wołający mówi dwie rzeczy: co wysłać i jak w międzyczasie wygląda
lista. Reszta jest wewnątrz modułu.

**Blocked by:** 01 — tożsamość szkicu w domenie.

**Status:** ready-for-agent

- [ ] Anulowanie, zapamiętanie, podgląd, cofnięcie, unieważnienie i tłumaczenie
      błędu żyją w jednym module; trzy zapisy są jego wołającymi
- [ ] Test: nieudane dodanie zdejmuje kontakt z listy, a lista wraca dokładnie
      do stanu sprzed podglądu
- [ ] Test: nieudana edycja przywraca poprzednie wartości wiersza
- [ ] Test: nieudane usunięcie przywraca wiersz na listę
- [ ] Błąd walidacji z serwera nadal ląduje przy właściwym polu formularza,
      a brak kontaktu nadal zamyka formularz z komunikatem o nieaktualnej liście
- [ ] Istniejące testy ekranu przechodzą bez zmian w ich treści
