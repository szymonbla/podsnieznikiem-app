# 03 — Dane przykładowe

**What to build:** świeżo postawiona aplikacja nie jest pusta — jedna komenda
wgrywa 24 kontakty z dostarczonego projektu, realistyczny zestaw fachowców
z polskimi znakami, wystarczający, żeby sensownie testować sortowanie
i wyszukiwanie.

**Blocked by:** 01

**Status:** done

- [x] Osobna komenda (`db:seed`), **nie migracja** — migracje opisują schemat, nie treść
- [x] 24 kontakty z projektu, z polskimi znakami w nazwiskach i specjalizacjach
- [x] Zestaw zawiera co najmniej jedną osobę występującą dwa razy z tym samym numerem i różną specjalizacją — pod ostrzeżenie o duplikacie
- [x] Ponowne uruchomienie komendy nie tworzy zdublowanego zestawu
