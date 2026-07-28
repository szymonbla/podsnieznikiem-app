import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import type { Contact } from "../domain/models"
import { compareContacts, type SortColumn } from "../domain/sorting"
import { resolveSearch, toSearchParams, type ResolvedSearch } from "../domain/view-state"
import { normalizePhone } from "../integration/format"

/**
 * Trasa podana identyfikatorem, nie importem obiektu trasy — ekran jest
 * wciągany przez router, więc import w drugą stronę zamknąłby cykl.
 */
const CONTACTS_ROUTE = "/kontakty" as const

/**
 * Zapytanie idzie po trzech polach naraz, bo właściciel nie wybiera, czym
 * szuka — wpisuje to, co pamięta (spec 0001, historie 9–11). Numer porównuje
 * się po samych cyfrach, więc `"602 118"` i `"+48 602"` trafiają tak samo.
 */
const matches = (contact: Contact, query: string): boolean => {
  const text = query.toLocaleLowerCase("pl")
  if (contact.name.toLocaleLowerCase("pl").includes(text)) return true
  if (contact.role.toLocaleLowerCase("pl").includes(text)) return true

  const digits = normalizePhone(query)

  return digits.length > 0 && contact.phone.includes(digits)
}

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
    const filtered = query === "" ? contacts : contacts.filter((c) => matches(c, query))

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
     * przydatne. Zmiana sortowania to pojedyncza decyzja, więc dokłada wpis.
     */
    setQuery: (q) => update({ q }, true),
    clearQuery: () => update({ q: "" }, true),
    toggleSort: (column) =>
      update(
        search.sort === column
          ? { dir: search.dir === "asc" ? "desc" : "asc" }
          : { sort: column, dir: "asc" },
        false
      )
  }
}
