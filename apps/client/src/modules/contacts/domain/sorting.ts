import type { Contact } from "./models"

/** Kolumny, po których wolno sortować — te same, które widać w tabeli. */
export const SORT_COLUMNS = ["name", "role", "phone"] as const

export type SortColumn = (typeof SORT_COLUMNS)[number]
export type SortDirection = "asc" | "desc"

export const DEFAULT_SORT: SortColumn = "name"
export const DEFAULT_DIRECTION: SortDirection = "asc"

/**
 * Porównanie po polsku — „Ł" idzie po „L", nie na koniec alfabetu, bo domyślne
 * porównanie ciągów w JS-ie układa je po kodach znaków (DESIGN.md §9).
 * Collator powstaje raz: tworzenie go per porównanie jest wolniejsze od samego
 * porównania.
 */
const collator = new Intl.Collator("pl", { numeric: true })

/**
 * Sortowanie po specjalizacji ustawia obok siebie ludzi od jednej dziedziny,
 * ale ich wzajemna kolejność musiałaby wtedy zależeć od kolejności z serwera —
 * czyli skakać. Remis rozstrzyga więc zawsze kolumna z nazwiskiem, rosnąco,
 * niezależnie od kierunku sortowania głównego.
 */
export const compareContacts =
  (column: SortColumn, direction: SortDirection) =>
  (left: Contact, right: Contact): number => {
    const primary = collator.compare(left[column], right[column])
    if (primary !== 0) return direction === "asc" ? primary : -primary

    return column === "name" ? 0 : collator.compare(left.name, right.name)
  }
