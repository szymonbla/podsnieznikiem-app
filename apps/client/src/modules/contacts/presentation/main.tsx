import { Plus } from "lucide-react"

import { shellCopy } from "../../../core/layouts/copy"
import { Button } from "../../../libs/ui/button"
import { useContacts } from "../integration/queries"
import { ContactFormDialog } from "./contact-form-dialog"
import { ContactsTable } from "./contacts-table"
import { contactsCopy, contactsCount, contactsMatchCount } from "./copy"
import { DeleteDialog } from "./delete-dialog"
import { EmptyState } from "../../../libs/ui/empty-state"
import { SearchField } from "./search-field"
import { useContactActions } from "./use-contact-actions"
import { useContactList } from "./use-contact-list"

/** There is one counter per screen, so the id can be a constant. */
const COUNT_ID = "contacts-count"

/**
 * The Contacts screen. An empty screen is never ambiguous — loading, no
 * contacts, no filter matches and a connection error are four different
 * messages, each saying what to do next (spec 0001, stories 7, 8, 16, 68, 69).
 *
 * The design's layout is three bands: the title with its action, a filter bar
 * closed off by a line, and only then the content. The screen has no maximum
 * width of its own — the list stretches as far as the sidebar leaves it.
 */
export const ContactsScreen = () => {
  const query = useContacts()
  const {
    state,
    hasRows,
    isReady,
    contacts,
    search,
    rows,
    total,
    isFiltered,
    setQuery,
    clearQuery,
    toggleSort
  } = useContactList(query)
  const actions = useContactActions()

  return (
    <main id="tresc" className="flex min-w-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 pt-5 pb-4 wide:px-8 wide:pt-[26px] wide:pb-[18px]">
        {/*
          The path before the title names the cottage the list belongs to.
          Today there is one cottage, so it is a label rather than navigation —
          which is why it is not a link.
        */}
        <h1 className="font-heading text-xl font-bold tracking-[-0.03em] wide:text-2xl">
          <span className="text-ink-faint">{shellCopy.cottage} / </span>
          {contactsCopy.title}
        </h1>

        {/*
          Adding stays quiet while loading and on error: appending to a list we
          do not know would end in a duplicate.
        */}
        {isReady ? (
          <Button type="button" onClick={actions.openCreate}>
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
            {contactsCopy.add}
          </Button>
        ) : null}
      </header>

      {isReady ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-separator px-4 pb-3.5 wide:px-8">
          {/* With not a single contact there is nothing to filter — the field would only clutter the screen. */}
          {hasRows ? (
            <SearchField
              value={search.q}
              onChange={setQuery}
              onClear={clearQuery}
              countId={COUNT_ID}
            />
          ) : null}
          {/*
            The counter stays quiet until there is something to count — "0
            contacts" while loading would simply be untrue.

            `status`, because the number changes as the filter is typed and the
            filter has no message of its own — without it a screen reader would
            not hear that the list got shorter.
          */}
          <p
            id={COUNT_ID}
            role="status"
            className="ml-auto text-xs whitespace-nowrap text-ink-heading"
          >
            {isFiltered ? contactsMatchCount(rows.length, total) : contactsCount(total)}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-[18px] px-4 pt-[18px] pb-12 wide:px-8 wide:pt-[22px] wide:pb-16">
        {state === "loading" ? (
          <p role="status" className="text-muted-foreground">
            {contactsCopy.loading}
          </p>
        ) : null}

        {state === "error" ? (
          <EmptyState
            assertive
            title={contactsCopy.loadError.title}
            description={contactsCopy.loadError.description}
            action={
              <Button type="button" onClick={() => void query.refetch()}>
                {contactsCopy.loadError.action}
              </Button>
            }
          />
        ) : null}

        {state === "empty" ? (
          <EmptyState
            title={contactsCopy.emptyList.title}
            description={contactsCopy.emptyList.description}
            action={
              <Button type="button" onClick={actions.openCreate}>
                {contactsCopy.emptyList.action}
              </Button>
            }
          />
        ) : null}

        {state === "no-matches" ? (
          <EmptyState
            title={contactsCopy.emptySearch.title(search.q.trim())}
            description={contactsCopy.emptySearch.description}
            action={
              <Button type="button" onClick={clearQuery}>
                {contactsCopy.emptySearch.action}
              </Button>
            }
          />
        ) : null}

        {state === "list" ? (
          <ContactsTable
            contacts={rows}
            sort={search.sort}
            direction={search.dir}
            onSort={toggleSort}
            onEdit={actions.openEdit}
            onRemove={actions.askRemove}
          />
        ) : null}

        {isReady ? (
          <p className="pt-1 text-2xs text-ink-heading">{contactsCopy.autosave}</p>
        ) : null}
      </div>

      <ContactFormDialog
        open={actions.isFormOpen}
        onOpenChange={actions.setFormOpen}
        {...(actions.edited === undefined ? {} : { contact: actions.edited })}
        contacts={contacts}
        onSubmit={actions.submit}
        pending={actions.isSaving}
      />

      <DeleteDialog
        contact={actions.removed}
        onOpenChange={(open) => {
          if (!open) actions.cancelRemove()
        }}
        onConfirm={actions.confirmRemove}
      />
    </main>
  )
}
