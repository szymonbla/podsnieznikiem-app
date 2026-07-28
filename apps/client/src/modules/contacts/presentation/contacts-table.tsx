import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "../../../libs/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../libs/ui/table"
import { isDraft } from "../domain/drafts"
import type { Contact } from "../domain/models"
import { SORT_COLUMNS, type SortColumn, type SortDirection } from "../domain/sorting"
import { formatPhone, phoneHref } from "../domain/phone"
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
 * The design's column widths (DESIGN.md §4): the name and the role split the
 * space 2 : 1.4, the number gets a fixed 170 px and the actions column 44 px.
 * Together with `table-fixed` they hold their own regardless of content length
 * — otherwise one long name would push the whole table around.
 */
const COLUMN_WIDTH: Record<SortColumn, string> = {
  name: "w-[45%]",
  role: "w-[31%]",
  phone: "w-[170px]"
}

/**
 * Below this width the percentages would squeeze the columns into unreadable
 * slivers, so the table stops narrowing and starts scrolling horizontally. The
 * `Table` container is then a separate, named, keyboard-reachable region.
 */
const TABLE_MIN_WIDTH = "min-w-[520px]"

/** In the design the number sits at the right edge — together with the heading that describes it. */
const COLUMN_ALIGN: Record<SortColumn, string> = {
  name: "justify-start text-left",
  role: "justify-start text-left",
  phone: "justify-end text-right"
}

/**
 * The arrow is decoration — `aria-sort` carries the direction for a screen
 * reader. An inactive column shows both arrows dimmed: it does not say how it
 * is sorted, only that it can be sorted on.
 */
const SortMark = ({ direction }: { readonly direction: SortDirection | null }) => {
  const Icon = direction === null ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown

  return (
    <Icon
      aria-hidden="true"
      strokeWidth={2.2}
      className={`size-[11px] shrink-0 ${direction === null ? "opacity-55" : "opacity-100"}`}
    />
  )
}

const copyPhone = async (phone: string) => {
  try {
    await navigator.clipboard.writeText(formatPhone(phone))
    toast.success(contactsCopy.row.copied)
  } catch {
    // The clipboard can be refused (no permission, a page without HTTPS).
    // Silence after such a click looks like a successful copy — and the owner
    // pastes the wrong thing.
    toast.error(contactsCopy.row.copyFailed)
  }
}

/**
 * A plain HTML table — three columns, no pagination and no server-side
 * sorting, so a table library would be overhead (DESIGN.md §2). `table`
 * semantics give the row and header roles for free; the seam 2 tests rest on
 * exactly that.
 *
 * A hairline separates the rows rather than a frame around the whole: the list
 * should read as one field, not as a card stuck onto the screen (design, §9).
 */
export const ContactsTable = ({
  contacts,
  sort,
  direction,
  onSort,
  onEdit,
  onRemove
}: ContactsTableProps) => (
  <Table
    regionLabel={contactsCopy.tableLabel}
    aria-label={contactsCopy.tableLabel}
    className={`table-fixed border-collapse ${TABLE_MIN_WIDTH}`}
  >
    <TableHeader className="[&_tr]:border-0">
      {/* The header stays on top while a long list scrolls. */}
      <TableRow className="sticky top-0 z-[5] border-b border-separator bg-background hover:bg-transparent">
        {SORT_COLUMNS.map((column) => {
          const active = sort === column

          return (
            <TableHead
              key={column}
              scope="col"
              aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
              className={`h-auto p-0 ${COLUMN_WIDTH[column]}`}
            >
              {/*
                No `aria-label`: the button's name is the column label itself,
                and `aria-sort` on the header carries the direction — that is
                how the ARIA sortable-table pattern works. Writing the direction
                into the label as well would make a screen reader read it twice,
                differently each time.
              */}
              <button
                type="button"
                onClick={() => onSort(column)}
                className={`column-label flex w-full cursor-pointer items-center gap-1.5 px-3 py-2.5 ${COLUMN_ALIGN[column]} ${active ? "text-foreground" : "text-ink-heading"}`}
              >
                {contactsCopy.columns[column]}
                <SortMark direction={active ? direction : null} />
              </button>
            </TableHead>
          )
        })}
        <TableHead scope="col" className="h-auto w-11 p-0">
          <span className="sr-only">{contactsCopy.columns.actions}</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {contacts.map((contact) => {
        const readable = formatPhone(contact.phone)

        return (
          <TableRow
            key={contact.id}
            className="h-14 border-b border-separator-soft hover:bg-surface-sunken"
          >
            <TableCell className="truncate px-3 py-2.5 font-bold">{contact.name}</TableCell>
            <TableCell className="px-3 py-2.5">
              <Badge variant="teal" className="max-w-full truncate">
                {contact.role}
              </Badge>
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right">
              <a
                href={phoneHref(contact.phone)}
                aria-label={`${contactsCopy.row.call}${readable}`}
                className="font-bold text-foreground tabular-nums hover:text-primary"
              >
                {readable}
              </a>
            </TableCell>
            <TableCell className="px-0 py-2.5 text-right">
              {/*
                An entry still waiting for the server has no identity to edit or
                delete it under — the menu appears together with that identity.
              */}
              {isDraft(contact) ? null : (
                <RowMenu
                  contact={contact}
                  onCopy={() => void copyPhone(contact.phone)}
                  onEdit={(opener) => onEdit(contact, opener)}
                  onRemove={(opener) => onRemove(contact, opener)}
                />
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
)
