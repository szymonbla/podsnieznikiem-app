# 04 — Powłoka i design tokeny

**What to build:** aplikacja wygląda jak dostarczony projekt, a nie jak domyślny
shadcn. Właściciel widzi nazwę swojego domku, aktywną pozycję `Kontakty`, grupę
nadchodzących sekcji oznaczonych jako niegotowe i stopkę z własnym nazwiskiem.
Na telefonie lista ma pierwszeństwo przed nawigacją.

**Blocked by:** 02

**Status:** done

- [x] Tokeny z `DESIGN.md` (paleta, typografia, promienie, siatka powłoki) wchodzą jako motyw Tailwinda; shadcn dziedziczy je zamiast domyślnych
- [x] Fonty hostowane lokalnie, nie z Google Fonts
- [x] Sidebar: nazwa domku · `Kontakty` (aktywne) · grupa „Wkrótce" — Rezerwacje, Finanse, Zapytania jako nieaktywne i oznaczone dla czytnika ekranu · stopka z właścicielem
- [x] Poniżej progu wąskiego ekranu sidebar staje się poziomym paskiem; grupa „Wkrótce" i stopka znikają
- [x] Fokus jest zawsze wyraźnie widoczny — pierścienia fokusu nie wolno usuwać
- [x] Animacje ustępują przy systemowym ograniczeniu ruchu
- [x] Powłoka mieszka w warstwie `core` i nie zawiera logiki domenowej
