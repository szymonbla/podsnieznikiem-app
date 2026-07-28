import type { Contact } from "./models"

/** The columns that may be sorted on — the ones visible in the table. */
export const SORT_COLUMNS = ["name", "role", "phone"] as const

export type SortColumn = (typeof SORT_COLUMNS)[number]
export type SortDirection = "asc" | "desc"

export const DEFAULT_SORT: SortColumn = "name"
export const DEFAULT_DIRECTION: SortDirection = "asc"

/**
 * Polish collation — "Ł" follows "L" rather than falling to the end of the
 * alphabet, which is where JavaScript's default string comparison puts it,
 * since that orders by character code (DESIGN.md §9). The collator is built
 * once: creating one per comparison costs more than the comparison itself.
 */
const collator = new Intl.Collator("pl", { numeric: true })

/**
 * Sorting by role puts people from one trade next to each other, but their
 * order among themselves would then depend on the order from the server — that
 * is, it would jump around. So a tie is always broken by the name column,
 * ascending, whatever the direction of the primary sort.
 */
export const compareContacts =
  (column: SortColumn, direction: SortDirection) =>
  (left: Contact, right: Contact): number => {
    const primary = collator.compare(left[column], right[column])
    if (primary !== 0) return direction === "asc" ? primary : -primary

    return column === "name" ? 0 : collator.compare(left.name, right.name)
  }
