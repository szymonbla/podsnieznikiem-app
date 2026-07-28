import { z } from "zod"

import { DEFAULT_DIRECTION, DEFAULT_SORT, SORT_COLUMNS, type SortColumn, type SortDirection } from "./sorting"

/**
 * The filter and the sort live in the address, not in component state — that
 * is what makes "back", a refresh and a link sent to yourself all work
 * (DESIGN.md §9).
 *
 * Every field has its own `catch`, so a hand-crafted address
 * (`?sort=age&dir=leftwards`) does not blow up the screen but falls back to
 * the default. One `catch` on the whole schema would drop the valid fields
 * along with the broken one.
 *
 * All fields are optional, because defaults are not written into the address:
 * the plain list is `/kontakty`, not `/kontakty?q=&sort=name&dir=asc`. A side
 * effect is that a link to the screen need not carry the view state.
 */
export const contactsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  sort: z.enum(SORT_COLUMNS).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).optional().catch(undefined)
})

/** The view state as it stands in the address — with holes where defaults rule. */
export type ContactsSearch = z.output<typeof contactsSearchSchema>

/** The view state with the holes filled — this is what the screen uses, not the raw address. */
export interface ResolvedSearch {
  readonly q: string
  readonly sort: SortColumn
  readonly dir: SortDirection
}

export const resolveSearch = (search: ContactsSearch): ResolvedSearch => ({
  q: search.q ?? "",
  sort: search.sort ?? DEFAULT_SORT,
  dir: search.dir ?? DEFAULT_DIRECTION
})

/** The way back: default values drop out of the address instead of cluttering it. */
export const toSearchParams = (resolved: ResolvedSearch): ContactsSearch => ({
  q: resolved.q === "" ? undefined : resolved.q,
  sort: resolved.sort === DEFAULT_SORT ? undefined : resolved.sort,
  dir: resolved.dir === DEFAULT_DIRECTION ? undefined : resolved.dir
})
