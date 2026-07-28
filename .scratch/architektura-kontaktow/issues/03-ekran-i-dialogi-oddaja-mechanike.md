# 03 — Ekran i dialogi oddają mechanikę modułom

**What to build:** Trzy zachowania, które dziś rozlewają się po całym ekranie
Kontakty, dostają po jednym module. Nic nie zmienia się dla właściciela — zmienia
się to, ile modułów musi o tych zachowaniach wiedzieć.

**Powrót focusu.** Dziś `HTMLElement` wędruje przez pięć interfejsów: menu
wiersza → tabela → ekran → moduł akcji → oba dialogi, żeby po zamknięciu dialogu
focus wrócił tam, skąd go otwarto. Po zmianie dialog sam zapamiętuje aktywny
element przy otwarciu i przywraca go przy zamknięciu; `opener` znika ze
wszystkich czterech pozostałych interfejsów.

**Escape.** Dziś pole specjalizacji ogłasza otwartą listę podpowiedzi atrybutem
w DOM, a dialog czyta go selektorem — sprzęgnięcie, którego kompilator nie
sprawdza z żadnej strony. Po zmianie zagnieżdżona zawartość rejestruje się jako
warstwa, a `Escape` zdejmuje najgłębszą. Pierwszy `Escape` nadal zamyka listę,
drugi dialog.

**Stan ekranu.** Dziś reguła „błąd bije pustkę bije filtr" jest wyliczana w ciele
ekranu, więc jedyny sposób jej sprawdzenia to render całości z podstawionym API.
Po zmianie moduł listy przyjmuje wynik zapytania i zwraca jeden dyskryminant
stanu; ekran czyta go i wybiera gałąź.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `opener` nie występuje w interfejsie menu wiersza, tabeli, ekranu ani
      modułu akcji; przywracanie focusu jest wewnątrz modułu dialogu
- [x] Testy „Escape zamyka dialog i wraca focus na przycisk" oraz „focus wraca na
      menu wiersza po edycji" przechodzą bez zmian w ich treści
- [x] Atrybut sygnalizujący otwartą listę podpowiedzi i obsługa `Escape` w
      dialogu formularza znikają; warstwy rejestrują się jawnie
- [x] Test „Escape zamyka najpierw listę, dialog zostaje otwarty" przechodzi
- [x] Moduł listy zwraca jeden dyskryminant stanu ekranu; ekran nie wylicza
      kolejności sprawdzeń ani flag pochodnych
- [x] Nowy test kolejności stanów (błąd > pustka > brak dopasowań) nie renderuje
      ekranu
- [x] Ciało ekranu to układ i teksty — bez reguł stanu

**Uwaga:** ticket łączy trzy pogłębienia (kandydaci 1, 2 i 4 z przeglądu
architektury) na życzenie. Jeśli w trakcie okaże się za obszerny na jedno
podejście, warstwa `Escape` odcina się najczyściej jako osobna praca.
