# Twarde usuwanie; "Cofnij" tworzy kontakt na nowo

Interfejs oferuje cofnięcie usunięcia przez 6 sekund, co zwykle sugeruje miękkie
usuwanie (`deleted_at`). Robimy odwrotnie: `DELETE` leci natychmiast i jest
trwały, a "Cofnij" wysyła `POST` z zapamiętanymi danymi. Kontakt wraca z **nowym
id**.

## Uzasadnienie

Odrzuciliśmy miękkie usuwanie, bo rozwiązuje problem, którego nie mamy — nie ma
audytu ani historii, skoro użytkownik jest jeden — a zanieczyszcza każde
późniejsze zapytanie warunkiem `where deleted_at is null` i wymaga sprzątania.

Odrzuciliśmy też odroczone usuwanie (klient czeka 6 s przed wysłaniem `DELETE`),
mimo że wygląda najelegancko. Rekord przez ten czas nadal jest w bazie, więc
przejście do innej zakładki i powrót sprawia, że react-query pobiera go z
powrotem i "usunięty" kontakt zmartwychwstaje. Zamknięcie karty w oknie 6 sekund
znaczy, że usunięcie nigdy się nie wydarzy.

Wybrany wariant jest szczery: stan serwera zawsze zgadza się z tym, co widać na
ekranie.

## Konsekwencje

Cofnięcie nie jest odwróceniem operacji, tylko powtórnym utworzeniem — kontakt
wraca z nową tożsamością. Nie ma to znaczenia, bo `id` nigdzie nie jest
widoczne ani przez nic referencjonowane. **Przestanie być prawdą**, gdy inna
domena zacznie wskazywać na kontakt (np. rezerwacja przypisana do sprzątaczki) —
wtedy tę decyzję trzeba przemyśleć na nowo.

Jeśli `POST` przy cofaniu padnie, kontakt przepada. Łagodzimy to komunikatem
błędu z ponowieniem, ale ryzyko zostaje niezerowe.

Anulowanie rezerwacji **nie jest** tym mechanizmem — to zmiana statusu, nie
usunięcie. Miękkie usuwanie nadal nie będzie tam potrzebne.
