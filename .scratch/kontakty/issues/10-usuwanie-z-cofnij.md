# 10 — Usuwanie z cofnięciem

**What to build:** właściciel usuwa nieaktualny numer, ale nie jednym omyłkowym
kliknięciem — najpierw widzi, kogo dokładnie kasuje. Po potwierdzeniu kontakt
znika natychmiast i trwale, a przez chwilę potem można to cofnąć: kontakt wraca
z tych samych danych, ale jako **nowy wpis o nowej tożsamości**. To nie jest
odwrócenie operacji, tylko powtórne utworzenie
([ADR-0003](../../../docs/adr/0003-twarde-usuwanie-z-cofnij.md)).

**Blocked by:** 09

**Status:** ready-for-human

- [x] Osobne okno ostrzegawcze z imieniem, nazwiskiem i specjalizacją usuwanego kontaktu
- [x] Usunięcie leci natychmiast i jest trwałe — bez miękkiego i bez odroczonego usuwania
- [x] Powiadomienie z akcją „Cofnij", okno na tyle długie, żeby zdążyć zareagować, i na tyle krótkie, żeby nie zawadzało
- [x] „Cofnij" tworzy kontakt na nowo z zapamiętanych danych — wraca z nowym identyfikatorem
- [x] Potwierdzenie przywrócenia; czytelny błąd, jeśli przywrócenie się nie uda — bez sugerowania, że kontakt wrócił
- [x] Nieodnaleziony kontakt: komunikat i unieważnienie listy
- [x] Testy szwu 1: trwałość usunięcia, usunięcie nieistniejącego kontaktu, odtworzenie kontaktu po usunięciu **z nowym identyfikatorem**
- [x] Testy szwu 2: usunięcie z odzwierciedleniem na liście, cofnięcie usunięcia, potwierdzenia
