import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import type { Contact } from "../domain/models"
import { compareContacts, type SortColumn } from "../domain/sorting"
import { resolveSearch, toSearchParams, type ResolvedSearch } from "../domain/view-state"
import { matchesQuery } from "../integration/search"

/**
 * The route given by id, not by importing the route object — the screen is
 * pulled in by the router, so an import the other way would close a cycle.
 */
const CONTACTS_ROUTE = "/kontakty" as const

interface ContactList {
  readonly search: ResolvedSearch
  readonly rows: ReadonlyArray<Contact>
  readonly total: number
  readonly isFiltered: boolean
  readonly setQuery: (query: string) => void
  readonly toggleSort: (column: SortColumn) => void
  readonly clearQuery: () => void
}

/**
 * The one place where view state from the address turns into rows to show.
 * Formatting, sorting and filtering share the same state, so splitting them
 * apart would mean reading the same address three times.
 */
export const useContactList = (contacts: ReadonlyArray<Contact>): ContactList => {
  const search = resolveSearch(useSearch({ from: CONTACTS_ROUTE }))
  const navigate = useNavigate({ from: CONTACTS_ROUTE })

  const query = search.q.trim()

  const rows = useMemo(() => {
    const filtered =
      query === "" ? contacts : contacts.filter((contact) => matchesQuery(contact, query))

    return [...filtered].sort(compareContacts(search.sort, search.dir))
  }, [contacts, query, search.sort, search.dir])

  const update = (next: Partial<ResolvedSearch>, replace: boolean) => {
    void navigate({ search: () => toSearchParams({ ...search, ...next }), replace })
  }

  return {
    search,
    rows,
    total: contacts.length,
    isFiltered: query !== "",

    /*
     * Typing replaces the history entry instead of adding one — otherwise a
     * single word would leave as many entries as it has letters, and "back"
     * would stop being useful.
     *
     * Clearing and changing the sort are single decisions, so they do add an
     * entry: without that, "back" after clearing the filter would have nowhere
     * to return to, and the spec promises a return to the previous filter
     * (story 26).
     */
    setQuery: (q) => update({ q }, true),
    clearQuery: () => update({ q: "" }, false),
    toggleSort: (column) =>
      update(
        search.sort === column
          ? { dir: search.dir === "asc" ? "desc" : "asc" }
          : { sort: column, dir: "asc" },
        false
      )
  }
}
