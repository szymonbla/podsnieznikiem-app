/**
 * Teksty powłoki — w jednym miejscu, poza JSX (DESIGN.md §3).
 *
 * Nazwa domku i właściciel są tu wpisane na sztywno świadomie: platforma
 * obsługuje dokładnie jeden domek i jednego użytkownika, więc nie są to dane,
 * tylko etykiety (`CONTEXT.md`).
 */
export const shellCopy = {
  cottage: "Pod Śnieżnikiem",
  navigationLabel: "Sekcje panelu",
  contacts: "Kontakty",
  upcomingGroup: "Wkrótce",
  /** Powtórzone przy każdej pozycji, bo czytnik ekranu nie widzi grupowania wzrokiem. */
  upcomingBadge: "Wkrótce",
  upcoming: ["Rezerwacje", "Finanse", "Zapytania"],
  owner: {
    initials: "SB",
    name: "Szymon Błażyński",
    role: "Właściciel"
  }
} as const
