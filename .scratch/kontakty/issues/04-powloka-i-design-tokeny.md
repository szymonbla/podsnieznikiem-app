# 04 — Powłoka i design tokeny

**What to build:** aplikacja wygląda jak dostarczony projekt, a nie jak domyślny
shadcn. Właściciel widzi nazwę swojego domku, aktywną pozycję `Kontakty`, grupę
nadchodzących sekcji oznaczonych jako niegotowe i stopkę z własnym nazwiskiem.
Na telefonie lista ma pierwszeństwo przed nawigacją.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Tokeny z `DESIGN.md` (paleta, typografia, promienie, siatka powłoki) wchodzą jako motyw Tailwinda; shadcn dziedziczy je zamiast domyślnych
- [ ] Fonty hostowane lokalnie, nie z Google Fonts
- [ ] Sidebar: nazwa domku · `Kontakty` (aktywne) · grupa „Wkrótce" — Rezerwacje, Finanse, Zapytania jako nieaktywne i oznaczone dla czytnika ekranu · stopka z właścicielem
- [ ] Poniżej progu wąskiego ekranu sidebar staje się poziomym paskiem; grupa „Wkrótce" i stopka znikają
- [ ] Fokus jest zawsze wyraźnie widoczny — pierścienia fokusu nie wolno usuwać
- [ ] Animacje ustępują przy systemowym ograniczeniu ruchu
- [ ] Powłoka mieszka w warstwie `core` i nie zawiera logiki domenowej
