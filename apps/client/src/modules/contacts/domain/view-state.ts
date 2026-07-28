import { z } from "zod"

import { DEFAULT_DIRECTION, DEFAULT_SORT, SORT_COLUMNS, type SortColumn, type SortDirection } from "./sorting"

/**
 * Filtr i sortowanie żyją w adresie, nie w stanie komponentu — dzięki temu
 * działa „wstecz", odświeżenie i wysłany sobie link (DESIGN.md §9).
 *
 * Każde pole ma własny `catch`, więc ręcznie zmajstrowany adres
 * (`?sort=wiek&dir=w-lewo`) nie wywala ekranu, tylko cofa się do wartości
 * domyślnej. Cały schemat z jednym `catch` gubiłby przy okazji pola poprawne.
 *
 * Wszystkie pola są opcjonalne, bo domyślnych nie zapisujemy w adresie:
 * zwykła lista to `/kontakty`, nie `/kontakty?q=&sort=name&dir=asc`. Skutkiem
 * ubocznym jest to, że link do ekranu nie musi nieść stanu widoku.
 */
export const contactsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  sort: z.enum(SORT_COLUMNS).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).optional().catch(undefined)
})

/** Stan widoku tak, jak stoi w adresie — z dziurami tam, gdzie panują domyślne. */
export type ContactsSearch = z.output<typeof contactsSearchSchema>

/** Stan widoku po uzupełnieniu dziur — tego używa ekran, nie surowego adresu. */
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

/** Droga powrotna: wartości domyślne wypadają z adresu, zamiast go zaśmiecać. */
export const toSearchParams = (resolved: ResolvedSearch): ContactsSearch => ({
  q: resolved.q === "" ? undefined : resolved.q,
  sort: resolved.sort === DEFAULT_SORT ? undefined : resolved.sort,
  dir: resolved.dir === DEFAULT_DIRECTION ? undefined : resolved.dir
})
