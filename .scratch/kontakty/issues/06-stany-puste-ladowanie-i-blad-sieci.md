# 06 — Stany puste, ładowanie i błąd sieci

**What to build:** pusty ekran nigdy nie jest dwuznaczny. Właściciel od razu wie,
czy dane się wczytują, czy nie ma ani jednego kontaktu, czy jego filtr nic nie
złapał, czy po prostu padło połączenie — i co w każdym z tych przypadków zrobić.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Stan ładowania widoczny — pusty ekran nie udaje braku kontaktów
- [ ] Brak kontaktów w ogóle: komunikat zachęcający do dodania pierwszego, prowadzący do dodania
- [ ] Brak wyników wyszukiwania: osobny komunikat z **przytoczonym zapytaniem**, prowadzący do zmiany filtra
- [ ] Błąd wczytywania: czytelny komunikat o problemie z połączeniem, odróżnialny od pustej listy
- [ ] Testy szwu 2 pokrywają oba stany puste, stan ładowania i stan błędu sieci
