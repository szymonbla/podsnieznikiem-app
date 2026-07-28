import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import type { Contact } from "../domain/models"
import { compareContacts, type SortColumn } from "../domain/sorting"
import { resolveSearch, toSearchParams, type ResolvedSearch } from "../domain/view-state"
import { matchesQuery } from "../integration/search"

/**
 * Trasa podana identyfikatorem, nie importem obiektu trasy — ekran jest
 * wciągany przez router, więc import w drugą stronę zamknąłby cykl.
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
 * Jedno miejsce, w którym stan widoku z adresu zamienia się w wiersze do
 * pokazania. Formatowanie, sortowanie i filtrowanie dzielą ten sam stan, więc
 * rozdzielenie ich oznaczałoby trzykrotne czytanie tego samego adresu.
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
     * Pisanie podmienia wpis w historii zamiast dokładać nowy — inaczej jedno
     * słowo zostawiałoby tyle wpisów, ile liter, i „wstecz" przestałoby być
     * przydatne.
     *
     * Wyczyszczenie i zmiana sortowania to za to pojedyncze decyzje, więc
     * dokładają wpis: bez tego „wstecz" po wyczyszczeniu filtra nie miałoby
     * dokąd wrócić, a spec obiecuje powrót do poprzedniego filtra (historia 26).
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
