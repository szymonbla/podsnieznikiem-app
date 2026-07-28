# 07 — Dodawanie kontaktu

**What to build:** właściciel dodaje nowy kontakt w kilka sekund, nie sięgając po
mysz: podaje imię i nazwisko, specjalizację i numer, zatwierdza Enterem, dostaje
potwierdzenie z nazwiskiem, a wpis pojawia się na liście od razu we właściwym
miejscu. Numer wolno wkleić w dowolnym formacie — aplikacja go czyści, zamiast
odrzucać. Formularz nie krzyczy w trakcie pisania: błąd pokazuje się przy
konkretnym polu dopiero po jego opuszczeniu.

**Blocked by:** 05

**Status:** ready-for-human

- [x] `POST` na kolekcję kontaktów; tworzenie wymaga kompletu trzech pól — brak specjalizacji to odrzucenie
- [x] Schemat formularza opisany zodem; asercja typowa porównuje **wyjście** schematu z typem żądania z kontraktu — rozjazd jest błędem kompilacji
- [x] Numer normalizowany przy zapisie (odstępy, myślniki, prefiks kierunkowy); do API idzie dziewięć cyfr
- [x] Walidacja po opuszczeniu pola i ponownie przy zapisie; błąd przy konkretnym polu; odpowiedź walidacyjna z serwera trafia na pole
- [x] Enter zapisuje, Escape zamyka, fokus uwięziony w oknie i wracający po zamknięciu tam, skąd je otwarto
- [x] Mutacja optymistyczna: nowy kontakt widoczny natychmiast, cofnięcie cache przy błędzie, unieważnienie po zakończeniu
- [x] Potwierdzenie z nazwiskiem po dodaniu
- [x] Testy szwu 1: utworzenie kompletnego kontaktu, odrzucenie niekompletnego, odrzucenie numeru o złej długości, przycinanie białych znaków, dopuszczenie dwóch kontaktów o tym samym numerze
- [x] Testy szwu 2: dodanie z odzwierciedleniem na liście, walidacja pól i moment jej wystąpienia, normalizacja numeru, Escape, uwięzienie i powrót fokusu
