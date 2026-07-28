import { useContacts } from "../integration/queries"
import { ContactsTable } from "./contacts-table"
import { contactsCopy, contactsCount, contactsMatchCount } from "./copy"
import { EmptyState } from "./empty-state"
import { SearchField } from "./search-field"
import { useContactList } from "./use-contact-list"

const actionClass =
  "rounded-[var(--radius)] bg-primary px-[18px] py-[10px] font-medium text-primary-foreground hover:bg-foreground-strong"

/**
 * Ekran Kontaktów. Pusty ekran nigdy nie jest dwuznaczny — ładowanie, brak
 * kontaktów, brak wyników filtra i błąd połączenia to cztery różne komunikaty,
 * każdy mówiący, co dalej (spec 0001, historie 7, 8, 16, 68, 69).
 */
export const ContactsScreen = () => {
  const { data, isPending, isError, refetch } = useContacts()
  const { search, rows, total, isFiltered, setQuery, clearQuery, toggleSort } = useContactList(
    data ?? []
  )

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold">{contactsCopy.title}</h1>
          {/*
            Licznik milczy, dopóki nie ma czego liczyć — „0 kontaktów" w trakcie
            wczytywania byłoby zwykłą nieprawdą.
          */}
          {isPending || isError ? null : (
            <p className="text-muted-foreground">
              {isFiltered ? contactsMatchCount(rows.length, total) : contactsCount(total)}
            </p>
          )}
        </div>

        {/* Bez ani jednego kontaktu nie ma czego filtrować — pole tylko zaśmiecałoby ekran. */}
        {!isPending && !isError && total > 0 ? (
          <SearchField value={search.q} onChange={setQuery} onClear={clearQuery} />
        ) : null}
      </header>

      {isPending ? (
        <p role="status" className="text-muted-foreground">
          {contactsCopy.loading}
        </p>
      ) : isError ? (
        <EmptyState
          assertive
          title={contactsCopy.loadError.title}
          description={contactsCopy.loadError.description}
          action={
            <button type="button" onClick={() => void refetch()} className={actionClass}>
              {contactsCopy.loadError.action}
            </button>
          }
        />
      ) : total === 0 ? (
        <EmptyState
          title={contactsCopy.emptyList.title}
          description={contactsCopy.emptyList.description}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={contactsCopy.emptySearch.title(search.q.trim())}
          description={contactsCopy.emptySearch.description}
          action={
            <button type="button" onClick={clearQuery} className={actionClass}>
              {contactsCopy.emptySearch.action}
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-separator">
          <ContactsTable
            contacts={rows}
            sort={search.sort}
            direction={search.dir}
            onSort={toggleSort}
          />
        </div>
      )}
    </main>
  )
}
