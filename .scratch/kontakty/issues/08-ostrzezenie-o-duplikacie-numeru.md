# 08 — Ostrzeżenie o duplikacie numeru

**What to build:** gdy właściciel wpisuje numer, który już gdzieś ma, formularz
mówi mu, do kogo ten numer należy — żeby ocenił, czy to pomyłka. Ale nie blokuje:
osoba wykonująca dwa fachy to dwa kontakty dzielące numer, więc zapis przechodzi.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Ostrzeżenie pod polem numeru, z nazwiskiem i specjalizacją właściciela numeru
- [ ] Liczone lokalnie na pobranej liście — bez dodatkowego zapytania do API
- [ ] Porównanie po znormalizowanym numerze, nie po tym, co widać w polu
- [ ] Przy edycji kontakt nie ostrzega sam o sobie
- [ ] Zapis przechodzi mimo ostrzeżenia — to nie jest błąd walidacji
- [ ] Test szwu 2: ostrzeżenie pojawia się z właściwym nazwiskiem i **nie blokuje zapisu**
