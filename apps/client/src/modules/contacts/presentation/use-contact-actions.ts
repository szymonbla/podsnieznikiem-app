import { useState } from "react"
import { toast } from "sonner"

import type { ContactFormOutput } from "../configuration/schema"
import { UNDO_WINDOW_MS } from "../configuration/query-settings"
import type { Contact, CreateContactBody } from "../domain/models"
import { ContactMutationError } from "../integration/optimistic-writes"
import { useCreateContact, useDeleteContact, useUpdateContact } from "../integration/queries"
import { contactsCopy } from "./copy"

interface ContactActions {
  /** The contact in the form dialog; `undefined` when adding. */
  readonly edited: Contact | undefined
  readonly isFormOpen: boolean
  readonly removed: Contact | undefined
  readonly isSaving: boolean
  readonly openCreate: () => void
  readonly openEdit: (contact: Contact) => void
  readonly setFormOpen: (open: boolean) => void
  readonly askRemove: (contact: Contact) => void
  readonly cancelRemove: () => void
  readonly confirmRemove: () => void
  readonly submit: (
    values: ContactFormOutput
  ) => Promise<Partial<Readonly<Record<string, string>>> | undefined>
}

/** Contact data without identity — enough to create it again. */
const bodyOf = (contact: Contact): CreateContactBody => ({
  name: contact.name,
  role: contact.role,
  phone: contact.phone
})

/**
 * The one place where the owner's decisions ("add", "fix", "delete", "undo")
 * turn into mutations and notifications. The screen keeps to its own job —
 * showing the list — and the dialogs get ready-made callbacks.
 */
export const useContactActions = (): ContactActions => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [edited, setEdited] = useState<Contact | undefined>(undefined)
  const [removed, setRemoved] = useState<Contact | undefined>(undefined)

  const create = useCreateContact()
  const update = useUpdateContact()
  const remove = useDeleteContact()

  /**
   * Splits a failure two ways: what belongs to a form field goes back to the
   * caller, the rest becomes a notification. A missing contact means the list
   * is stale — the mutation invalidates it in `onSettled` anyway, so all that
   * is left is to tell the owner (DESIGN.md §8).
   */
  const reportFailure = (error: unknown, fallback: string) => {
    if (error instanceof ContactMutationError) {
      if (error.notFound) {
        toast.error(contactsCopy.notFound)
        /* A form for a contact that no longer exists has nothing to save. */
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
      // Without implying the contact came back — because it did not (ticket 10).
      onError: () => toast.error(contactsCopy.remove.restoreFailed)
    })
  }

  return {
    edited,
    isFormOpen,
    removed,
    isSaving: create.isPending || update.isPending,

    openCreate: () => {
      setEdited(undefined)
      setFormOpen(true)
    },
    openEdit: (contact) => {
      setEdited(contact)
      setFormOpen(true)
    },
    setFormOpen,

    askRemove: setRemoved,
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
           * The update is partial, but the form shows all the fields anyway —
           * sending the whole triple matches the contract and saves tracking
           * which field the owner actually touched.
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
