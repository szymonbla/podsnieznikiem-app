import { useRef, useState } from "react"
import { toast } from "sonner"

import type { ContactFormOutput } from "../configuration/schema"
import { UNDO_WINDOW_MS } from "../configuration/query-settings"
import type { Contact, CreateContactBody } from "../domain/models"
import {
  ContactMutationError,
  useCreateContact,
  useDeleteContact,
  useUpdateContact
} from "../integration/queries"
import { contactsCopy } from "./copy"

interface ContactActions {
  /** Kontakt w oknie formularza; `undefined` przy dodawaniu. */
  readonly edited: Contact | undefined
  readonly isFormOpen: boolean
  readonly removed: Contact | undefined
  readonly isSaving: boolean
  readonly openCreate: (opener: HTMLElement | null) => void
  readonly openEdit: (contact: Contact, opener: HTMLElement | null) => void
  readonly setFormOpen: (open: boolean) => void
  readonly askRemove: (contact: Contact, opener: HTMLElement | null) => void
  /** Fokus wraca tam, skąd okno otwarto (spec 0001, historia 64). */
  readonly restoreFocus: () => void
  readonly cancelRemove: () => void
  readonly confirmRemove: () => void
  readonly submit: (
    values: ContactFormOutput
  ) => Promise<Readonly<Record<string, string>> | undefined>
}

/** Dane kontaktu bez tożsamości — tyle wystarczy, żeby stworzyć go na nowo. */
const bodyOf = (contact: Contact): CreateContactBody => ({
  name: contact.name,
  role: contact.role,
  phone: contact.phone
})

/**
 * Jedno miejsce, w którym decyzje właściciela („dodaj", „popraw", „usuń",
 * „cofnij") zamieniają się w mutacje i powiadomienia. Ekran zostaje przy swoim
 * zadaniu — pokazywaniu listy — a okna dostają gotowe wywołania zwrotne.
 */
export const useContactActions = (): ContactActions => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [edited, setEdited] = useState<Contact | undefined>(undefined)
  const [removed, setRemoved] = useState<Contact | undefined>(undefined)
  const opener = useRef<HTMLElement | null>(null)

  const create = useCreateContact()
  const update = useUpdateContact()
  const remove = useDeleteContact()

  /**
   * Rozdziela awarię na dwie drogi: to, co należy do pola formularza, wraca
   * wywołującemu, a reszta idzie w powiadomienie. Nieodnaleziony kontakt znaczy,
   * że lista jest nieaktualna — mutacja i tak unieważnia ją w `onSettled`,
   * więc zostaje powiedzieć to właścicielowi (DESIGN.md §8).
   */
  const reportFailure = (error: unknown, fallback: string) => {
    if (error instanceof ContactMutationError) {
      if (error.notFound) {
        toast.error(contactsCopy.notFound)
        /* Formularz kontaktu, którego już nie ma, nie ma czego zapisać. */
        setFormOpen(false)

        return undefined
      }
      if (Object.keys(error.fieldErrors).length > 0) return error.fieldErrors
    }

    toast.error(fallback)

    return undefined
  }

  const restore = (contact: Contact) => {
    create.mutate(bodyOf(contact), {
      onSuccess: () => toast.success(contactsCopy.remove.restored(contact.name)),
      // Bez sugerowania, że kontakt wrócił — bo nie wrócił (ticket 10).
      onError: () => toast.error(contactsCopy.remove.restoreFailed)
    })
  }

  return {
    edited,
    isFormOpen,
    removed,
    isSaving: create.isPending || update.isPending,

    openCreate: (from) => {
      opener.current = from
      setEdited(undefined)
      setFormOpen(true)
    },
    openEdit: (contact, from) => {
      opener.current = from
      setEdited(contact)
      setFormOpen(true)
    },
    setFormOpen,
    /*
     * Fokus przywracany jawnie, bo przy oknie otwieranym z pozycji menu (a nie
     * z własnego wyzwalacza) biblioteka nie ma czego zapamiętać — element,
     * który miał fokus w chwili otwarcia, znika razem z menu.
     */
    restoreFocus: () => {
      const target = opener.current
      if (target !== null && document.contains(target)) target.focus()
    },

    askRemove: (contact, from) => {
      opener.current = from
      setRemoved(contact)
    },
    cancelRemove: () => setRemoved(undefined),
    confirmRemove: () => {
      const contact = removed
      if (contact === undefined) return

      setRemoved(undefined)
      remove.mutate(contact.id, {
        onSuccess: () => {
          toast.success(contactsCopy.remove.success(contact.name), {
            duration: UNDO_WINDOW_MS,
            action: { label: contactsCopy.remove.undo, onClick: () => restore(contact) }
          })
        },
        onError: (error) => reportFailure(error, contactsCopy.remove.failure)
      })
    },

    submit: async (values) => {
      const target = edited

      try {
        if (target === undefined) {
          const created = await create.mutateAsync(values)
          toast.success(contactsCopy.form.create.success(created.name))
        } else {
          /*
           * Aktualizacja jest częściowa, ale formularz i tak pokazuje komplet
           * pól — wysłanie całej trójki jest zgodne z kontraktem i nie wymaga
           * pilnowania, które pole właściciel naprawdę ruszył.
           */
          const saved = await update.mutateAsync({ id: target.id, body: values })
          toast.success(contactsCopy.form.edit.success(saved.name))
        }

        setFormOpen(false)

        return undefined
      } catch (error) {
        return reportFailure(
          error,
          target === undefined
            ? contactsCopy.form.create.failure
            : contactsCopy.form.edit.failure
        )
      }
    }
  }
}
