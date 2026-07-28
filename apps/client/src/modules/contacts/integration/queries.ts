import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../../../core/api"
import { CONTACTS_QUERY_KEY, CONTACTS_STALE_TIME_MS } from "../configuration/query-settings"
import { draftContact } from "../domain/drafts"
import type { Contact, CreateContactBody, UpdateContactBody } from "../domain/models"
import { useOptimisticWrite } from "./optimistic-writes"

const fetchContacts = async (): Promise<ReadonlyArray<Contact>> => {
  const { data, error, response } = await apiClient.GET("/contacts")

  // `openapi-fetch` does not throw — a failed request comes back as `error`.
  // react-query expects an exception, so we translate that here, once.
  if (error !== undefined || data === undefined) {
    throw new Error(`Failed to fetch contacts (HTTP ${response.status})`)
  }

  return data
}

export const useContacts = () =>
  useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: fetchContacts,
    staleTime: CONTACTS_STALE_TIME_MS
  })

/*
 * The three writes below say only what to send and how the list looks in the
 * meantime. Everything the three have in common — cancelling, the snapshot, the
 * rollback, the invalidation and the translation of a failure — sits in
 * `useOptimisticWrite`.
 */

export const useCreateContact = () =>
  useOptimisticWrite({
    send: (body: CreateContactBody) => apiClient.POST("/contacts", { body }),
    preview: (contacts, body) => [...contacts, draftContact(body)]
  })

interface ContactUpdate {
  readonly id: string
  readonly body: UpdateContactBody
}

export const useUpdateContact = () =>
  useOptimisticWrite({
    send: ({ id, body }: ContactUpdate) =>
      apiClient.PATCH("/contacts/{id}", { params: { path: { id } }, body }),
    preview: (contacts, { id, body }) =>
      contacts.map((contact) =>
        contact.id === id
          ? // The modification stamp is raised in the preview too — otherwise
            // the list would show the old date until invalidation (ticket 09).
            { ...contact, ...body, updatedAt: new Date().toISOString() }
          : contact
      )
  })

export const useDeleteContact = () =>
  useOptimisticWrite({
    send: (id: string) => apiClient.DELETE("/contacts/{id}", { params: { path: { id } } }),
    preview: (contacts, id) => contacts.filter((contact) => contact.id !== id)
  })
