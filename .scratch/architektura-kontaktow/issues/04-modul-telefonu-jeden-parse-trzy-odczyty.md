# 04 — Moduł Telefonu: jeden parse, trzy odczyty

**What to build:** Numer występuje dziś w trzech postaciach — tak jak go wpisano,
dziewięć cyfr do bazy i porównań, oraz zapis czytelny na ekranie — a wszystkie
trzy mają ten sam typ `string`. Wołający musi pamiętać, którą trzyma; sprawdzanie
duplikatu normalizuje obie strony na wszelki wypadek, bo typ tego nie powie.

Po zmianie Telefon jest modułem: raz się go czyta z tego, co wpisano lub wkleiono,
a potem pyta o cyfry (baza, równość), o postać czytelną (tabela, formularz) albo
o adres do wybrania numeru. Normalizacja dzieje się na wejściu i nigdzie dalej.

Zachowanie bez zmian: numer wklejony ze spacjami, myślnikami lub `+48` nadal jest
normalizowany, a nie odrzucany; wyszukiwanie nadal traktuje samotną cyfrę wśród
liter jako tekst, nie jako pytanie o numer; powtórzony numer nadal jest
ostrzeżeniem, nie błędem.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Jedno miejsce wyprowadza cyfry z tego, co wpisano; nic dalej nie
      normalizuje powtórnie
- [ ] Wyszukiwanie zachowuje własną regułę „czy to w ogóle pytanie o numer"
- [ ] Asercja zgodności schematu formularza z ciałem żądania (ADR-0001) nadal się
      kompiluje — wyjściem walidacji zostaje to, co przyjmuje API
- [ ] Istniejące testy numeru, wyszukiwania i duplikatu przechodzą bez zmian
      w ich treści
- [ ] CONTEXT.md → Telefon opisuje trzy odczyty jednej wartości
