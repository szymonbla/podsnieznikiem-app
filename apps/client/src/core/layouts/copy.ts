/**
 * Shell copy — in one place, outside the JSX (DESIGN.md §3). The values stay
 * Polish: this is what the owner reads on screen.
 *
 * The cottage name and the owner are hard-coded here on purpose: the platform
 * serves exactly one cottage and one user, so these are labels, not data
 * (`CONTEXT.md`).
 */
export const shellCopy = {
  cottage: "Pod Śnieżnikiem",
  navigationLabel: "Sekcje panelu",
  /** The first tab stop — the navigation precedes the content on every route. */
  skipToContent: "Przejdź do treści",
  /** Sonner names its region in English until it is given a label of its own. */
  notifications: "Powiadomienia",
  contacts: "Kontakty",
  tasks: "Zadania",
  upcomingGroup: "Wkrótce",
  /** Repeated on every item, because a screen reader cannot see the grouping. */
  upcomingBadge: "Wkrótce",
  upcoming: ["Rezerwacje", "Finanse", "Zapytania"],
  owner: {
    initials: "SB",
    name: "Szymon Błażyński",
    role: "Właściciel"
  }
} as const
