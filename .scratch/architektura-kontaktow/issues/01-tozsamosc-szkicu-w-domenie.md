# 01 — Tożsamość szkicu przenosi się do domeny

**What to build:** Kontakt widoczny na liście, zanim serwer odpowie, to pojęcie
domenowe — „kontakt bez tożsamości z bazy" — a nie szczegół react-query. Dziś
tabela pyta o to moduł integracji, czyli sięga w górę warstw wbrew DESIGN.md §3.
Po zmianie pytanie „czy ten kontakt ma już tożsamość?" zadaje się warstwie
`domain`, a integracja korzysta z tego samego pojęcia.

Zachowanie na ekranie się nie zmienia: wiersz szkicu nadal nie ma menu akcji,
bo nie ma pod czym go edytować ani usunąć.

Prefaktor pod ticket 02 — recepta zapisu optymistycznego będzie tworzyć szkice
i musi mieć skąd wziąć to pojęcie.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Prefiks szkicu, rozpoznanie szkicu i tworzenie szkicu mieszkają w `domain`
- [x] Prezentacja nie importuje niczego z `integration` po to pojęcie
- [x] CONTEXT.md ma hasło o kontakcie bez tożsamości, z konsekwencją: szkic nie
      ma akcji w wierszu, a jego id nie trafia do żadnego żądania
- [x] Cały zestaw testów przechodzi bez zmian w treści testów
