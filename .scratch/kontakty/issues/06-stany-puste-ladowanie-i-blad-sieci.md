# 06 — Stany puste, ładowanie i błąd sieci

**What to build:** pusty ekran nigdy nie jest dwuznaczny. Właściciel od razu wie,
czy dane się wczytują, czy nie ma ani jednego kontaktu, czy jego filtr nic nie
złapał, czy po prostu padło połączenie — i co w każdym z tych przypadków zrobić.

**Blocked by:** 05

**Status:** done

- [x] Stan ładowania widoczny — pusty ekran nie udaje braku kontaktów
- [~] Brak kontaktów w ogóle: komunikat zachęcający do dodania pierwszego, prowadzący do dodania
      — komunikat jest, przycisku prowadzącego do dodania nie ma: dodawanie powstaje
      w 07. `EmptyState` przyjmuje `action`, więc 07 tylko wstawia tam przycisk.
- [x] Brak wyników wyszukiwania: osobny komunikat z **przytoczonym zapytaniem**, prowadzący do zmiany filtra
- [x] Błąd wczytywania: czytelny komunikat o problemie z połączeniem, odróżnialny od pustej listy
- [x] Testy szwu 2 pokrywają oba stany puste, stan ładowania i stan błędu sieci
