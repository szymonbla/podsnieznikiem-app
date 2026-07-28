import { toast } from "sonner"

import type { Contact } from "../domain/models"
import { SORT_COLUMNS, type SortColumn, type SortDirection } from "../domain/sorting"
import { formatPhone, phoneHref } from "../domain/phone"
import { isDraft } from "../integration/queries"
import { contactsCopy } from "./copy"
import { RowMenu } from "./row-menu"

interface ContactsTableProps {
  readonly contacts: ReadonlyArray<Contact>
  readonly sort: SortColumn
  readonly direction: SortDirection
  readonly onSort: (column: SortColumn) => void
  readonly onEdit: (contact: Contact, opener: HTMLElement | null) => void
  readonly onRemove: (contact: Contact, opener: HTMLElement | null) => void
}

/**
 * Szerokości kolumn z projektu (DESIGN.md §4): nazwisko i specjalizacja dzielą
 * miejsce w proporcji 2 : 1,4, numer dostaje stałe 170 px, kolumna akcji 44 px.
 * Razem z `table-fixed` trzymają się swojego niezależnie od długości treści —
 * inaczej jedno długie nazwisko rozpychałoby całą tabelę.
 */
const COLUMN_WIDTH: Record<SortColumn, string> = {
  name: "w-[45%]",
  role: "w-[31%]",
  phone: "w-[170px]"
}

/** Strzałka jest ozdobą — kierunek dla czytnika ekranu niesie `aria-sort`. */
const SortMark = ({ direction }: { readonly direction: SortDirection | null }) => (
  <span aria-hidden="true" className="ml-1 inline-block w-3 text-ink-placeholder">
    {direction === null ? "" : direction === "asc" ? "↑" : "↓"}
  </span>
)

const copyPhone = async (phone: string) => {
  try {
    await navigator.clipboard.writeText(formatPhone(phone))
    toast.success(contactsCopy.row.copied)
  } catch {
    // Schowka można odmówić (brak zgody, strona bez HTTPS). Cisza po takim
    // kliknięciu wygląda jak udane kopiowanie — i właściciel wkleja nie to.
    toast.error(contactsCopy.row.copyFailed)
  }
}

/**
 * Zwykła tabela HTML — trzy kolumny, bez paginacji i bez sortowania po stronie
 * serwera, więc biblioteka do tabel byłaby narzutem (DESIGN.md §2).
 * Semantyka `table` daje rolę wiersza i nagłówka za darmo; testy szwu 2
 * opierają się właśnie na niej.
 */
export const ContactsTable = ({
  contacts,
  sort,
  direction,
  onSort,
  onEdit,
  onRemove
}: ContactsTableProps) => (
  <table className="w-full table-fixed border-collapse text-left">
    <thead>
      <tr className="bg-muted">
        {SORT_COLUMNS.map((column) => {
          const active = sort === column
          const label = contactsCopy.columns[column]

          return (
            <th
              key={column}
              scope="col"
              aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
              className={`p-0 label-caps font-medium text-ink-heading ${COLUMN_WIDTH[column]}`}
            >
              {/*
                Bez `aria-label`: nazwą przycisku jest sama etykieta kolumny,
                a kierunek niesie `aria-sort` na nagłówku — tak działa wzorzec
                sortowalnej tabeli w ARIA. Wpisanie kierunku jeszcze raz
                w etykietę kazałoby czytnikowi przeczytać go dwa razy, za
                każdym razem inaczej.
              */}
              <button
                type="button"
                onClick={() => onSort(column)}
                className="flex w-full items-center px-4 py-3 text-left hover:bg-muted-hover"
              >
                {label}
                <SortMark direction={active ? direction : null} />
              </button>
            </th>
          )
        })}
        <th scope="col" className="w-11">
          <span className="sr-only">{contactsCopy.columns.actions}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {contacts.map((contact) => {
        const readable = formatPhone(contact.phone)

        return (
          <tr key={contact.id} className="border-t border-separator bg-surface">
            <td className="truncate px-4 py-3 font-medium">{contact.name}</td>
            <td className="truncate px-4 py-3 text-muted-foreground">{contact.role}</td>
            <td className="px-4 py-3">
              <a
                href={phoneHref(contact.phone)}
                aria-label={`${contactsCopy.row.call}${readable}`}
                className="tabular-nums text-primary hover:underline"
              >
                {readable}
              </a>
            </td>
            <td className="px-2 py-3">
              {/*
                Wpis czekający jeszcze na odpowiedź serwera nie ma tożsamości,
                pod którą dałoby się go edytować ani usunąć — menu pojawia się
                razem z nią.
              */}
              {isDraft(contact) ? null : (
              <RowMenu
                contact={contact}
                onCopy={() => void copyPhone(contact.phone)}
                onEdit={(opener) => onEdit(contact, opener)}
                onRemove={(opener) => onRemove(contact, opener)}
              />
              )}
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)
