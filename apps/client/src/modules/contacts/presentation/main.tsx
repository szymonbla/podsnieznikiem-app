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

  /*
   * Stan ekranu nazwany raz, zamiast rozstrzygany po kolei w drzewie JSX —
   * kolejność sprawdzania jest tu regułą („błąd bije pustkę, pustka bije
   * filtr"), a nie przypadkiem zagnieżdżenia.
   */
  const view = ((): "loading" | "error" | "empty" | "no-matches" | "list" => {
    if (isPending) return "loading"
    if (isError) return "error"
    if (total === 0) return "empty"
    if (rows.length === 0) return "no-matches"

    return "list"
  })()

  /* Licznik i filtr mają sens dopiero wtedy, gdy jest co liczyć i co filtrować. */
  const hasRows = view === "no-matches" || view === "list"

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold">{contactsCopy.title}</h1>
          {/*
            Licznik milczy, dopóki nie ma czego liczyć — „0 kontaktów" w trakcie
            wczytywania byłoby zwykłą nieprawdą.
          */}
          {hasRows || view === "empty" ? (
            <p className="text-muted-foreground">
              {isFiltered ? contactsMatchCount(rows.length, total) : contactsCount(total)}
            </p>
          ) : null}
        </div>

        {/* Bez ani jednego kontaktu nie ma czego filtrować — pole tylko zaśmiecałoby ekran. */}
        {hasRows ? (
          <SearchField value={search.q} onChange={setQuery} onClear={clearQuery} />
        ) : null}
      </header>

      {view === "loading" ? (
        <p role="status" className="text-muted-foreground">
          {contactsCopy.loading}
        </p>
      ) : null}

      {view === "error" ? (
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
      ) : null}

      {view === "empty" ? (
        <EmptyState
          title={contactsCopy.emptyList.title}
          description={contactsCopy.emptyList.description}
        />
      ) : null}

      {view === "no-matches" ? (
        <EmptyState
          title={contactsCopy.emptySearch.title(search.q.trim())}
          description={contactsCopy.emptySearch.description}
          action={
            <button type="button" onClick={clearQuery} className={actionClass}>
              {contactsCopy.emptySearch.action}
            </button>
          }
        />
      ) : null}

      {view === "list" ? (
        <div className="overflow-hidden rounded-card border border-separator">
          <ContactsTable
            contacts={rows}
            sort={search.sort}
            direction={search.dir}
            onSort={toggleSort}
          />
        </div>
      ) : null}
    </main>
  )
}
