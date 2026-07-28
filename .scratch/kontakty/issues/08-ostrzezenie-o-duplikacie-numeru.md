# 08 — Ostrzeżenie o duplikacie numeru

**What to build:** gdy właściciel wpisuje numer, który już gdzieś ma, formularz
mówi mu, do kogo ten numer należy — żeby ocenił, czy to pomyłka. Ale nie blokuje:
osoba wykonująca dwa fachy to dwa kontakty dzielące numer, więc zapis przechodzi.

**Blocked by:** 07

**Status:** ready-for-human

- [x] Ostrzeżenie pod polem numeru, z nazwiskiem i specjalizacją właściciela numeru
- [x] Liczone lokalnie na pobranej liście — bez dodatkowego zapytania do API
- [x] Porównanie po znormalizowanym numerze, nie po tym, co widać w polu
- [x] Przy edycji kontakt nie ostrzega sam o sobie
- [x] Zapis przechodzi mimo ostrzeżenia — to nie jest błąd walidacji
- [x] Test szwu 2: ostrzeżenie pojawia się z właściwym nazwiskiem i **nie blokuje zapisu**
