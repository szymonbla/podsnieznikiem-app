import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import type { Contact } from "../domain/models"
import { hasRows, isReady, screenState, type ScreenState } from "../domain/screen-state"
import { compareContacts, type SortColumn } from "../domain/sorting"
import { resolveSearch, toSearchParams, type ResolvedSearch } from "../domain/view-state"
import { matchesQuery } from "../integration/search"

/**
 * The route given by id, not by importing the route object — the screen is
 * pulled in by the router, so an import the other way would close a cycle.
 */
const CONTACTS_ROUTE = "/kontakty" as const

/** As much of the query as the list cares about — the rest belongs to the screen. */
export interface ContactsQuery {
  readonly data: ReadonlyArray<Contact> | undefined
  readonly isPending: boolean
  readonly isError: boolean
}

interface ContactList {
  /** What the screen shows — the whole situation under one name. */
  readonly state: ScreenState
  /** Whether the counter and the filter field have anything to say. */
  readonly hasRows: boolean
  /** Whether the list is known, so adding may be offered. */
  readonly isReady: boolean
  /** Everything fetched, unfiltered — the duplicate warning is computed on it. */
  readonly contacts: ReadonlyArray<Contact>
  readonly search: ResolvedSearch
  readonly rows: ReadonlyArray<Contact>
  readonly total: number
  readonly isFiltered: boolean
  readonly setQuery: (query: string) => void
  readonly toggleSort: (column: SortColumn) => void
  readonly clearQuery: () => void
}

/**
 * The one place where the query's result and the view state from the address
 * turn into rows to show — together with the name of what the screen shows.
 * Filtering, sorting and that name all rest on the same two inputs, so split
 * apart they would mean reading the same address three times.
 */
export const useContactList = (query: ContactsQuery): ContactList => {
  const contacts = query.data ?? []
  const search = resolveSearch(useSearch({ from: CONTACTS_ROUTE }))
  const navigate = useNavigate({ from: CONTACTS_ROUTE })

  const text = search.q.trim()

  const rows = useMemo(() => {
    const filtered =
      text === "" ? contacts : contacts.filter((contact) => matchesQuery(contact, text))

    return [...filtered].sort(compareContacts(search.sort, search.dir))
  }, [contacts, text, search.sort, search.dir])

  const update = (next: Partial<ResolvedSearch>, replace: boolean) => {
    void navigate({ search: () => toSearchParams({ ...search, ...next }), replace })
  }

  const state = screenState({
    isPending: query.isPending,
    isError: query.isError,
    total: contacts.length,
    matches: rows.length
  })

  return {
    state,
    hasRows: hasRows(state),
    isReady: isReady(state),
    contacts,
    search,
    rows,
    total: contacts.length,
    isFiltered: text !== "",

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
