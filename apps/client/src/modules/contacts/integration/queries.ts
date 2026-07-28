import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../../core/api"
import { CONTACTS_QUERY_KEY, CONTACTS_STALE_TIME_MS } from "../configuration/query-settings"
import { isContactField } from "../configuration/schema"
import type {
  Contact,
  ContactField,
  ContactWriteFailure,
  CreateContactBody,
  UpdateContactBody
} from "../domain/models"

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

/**
 * A write failure in the shape the screen can react to: `notFound` leads to
 * invalidating the list (it is stale), `fieldErrors` go back to individual form
 * fields, everything else becomes a general message (DESIGN.md §8).
 */
export class ContactMutationError extends Error {
  constructor(
    message: string,
    readonly notFound: boolean,
    readonly fieldErrors: Partial<Readonly<Record<ContactField, string>>>
  ) {
    super(message)
    this.name = "ContactMutationError"
  }
}

/**
 * The name of a domain error that already has handling. Adding another error
 * on the server changes the union in the contract, and then this parameter
 * stops accepting `tag` — compilation fails until the new case gets a branch
 * (DESIGN.md §8).
 */
const assertHandled = (tag: "ContactNotFound"): void => void tag

/**
 * The error response is converted once, in one place: a domain error is
 * recognised by its tag, a schema validation is spread across fields by the
 * path from the parse error.
 *
 * The branching is exhaustive: a new domain error in the contract has no
 * branch, so `assertHandled` stops compiling.
 */
const toMutationError = (
  status: number,
  body: ContactWriteFailure | undefined
): ContactMutationError => {
  if (body?._tag === "ContactNotFound") {
    assertHandled(body._tag)

    return new ContactMutationError("Contact does not exist", true, {})
  }

  const fieldErrors: Partial<Record<ContactField, string>> = {}
  for (const issue of body?.issues ?? []) {
    const field = issue.path[0]
    if (isContactField(field)) fieldErrors[field] ??= issue.message
  }

  return new ContactMutationError(
    `Request failed (HTTP ${status})`,
    false,
    fieldErrors
  )
}

/**
 * An optimistic mutation of the list: the screen shows the result immediately,
 * the cache rolls back to its previous state on failure, and once settled the
 * list is invalidated — one recipe for create, edit and delete (DESIGN.md §9).
 */
const useOptimisticContacts = () => {
  const queryClient = useQueryClient()

  return {
    /** Cancels in-flight queries so a response on the wire cannot overwrite the preview. */
    apply: async (change: (contacts: ReadonlyArray<Contact>) => ReadonlyArray<Contact>) => {
      await queryClient.cancelQueries({ queryKey: CONTACTS_QUERY_KEY })
      const previous = queryClient.getQueryData<ReadonlyArray<Contact>>(CONTACTS_QUERY_KEY)
      if (previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, change(previous))
      }

      return { previous }
    },
    revert: (context: { previous: ReadonlyArray<Contact> | undefined } | undefined) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, context.previous)
      }
    },
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    }
  }
}

/**
 * A contact visible immediately, before the server answers. The temporary id is
 * local and lives until the list is invalidated — the real one is assigned by
 * the database (ADR-0003: "undo" creates an entry with a new identity anyway).
 */
export const DRAFT_ID_PREFIX = "draft:"

/** An entry visible only locally — without an identity from the database yet. */
export const isDraft = (contact: Contact): boolean => contact.id.startsWith(DRAFT_ID_PREFIX)

const draftContact = (body: CreateContactBody): Contact => {
  const now = new Date().toISOString()

  return { id: `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`, ...body, createdAt: now, updatedAt: now }
}

export const useCreateContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async (body: CreateContactBody): Promise<Contact> => {
      const { data, error, response } = await apiClient.POST("/contacts", { body })
      if (error !== undefined || data === undefined) {
        throw toMutationError(response.status, error)
      }

      return data
    },
    onMutate: (body) => cache.apply((contacts) => [...contacts, draftContact(body)]),
    onError: (_error, _body, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}

export const useUpdateContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async ({
      id,
      body
    }: {
      readonly id: string
      readonly body: UpdateContactBody
    }): Promise<Contact> => {
      const { data, error, response } = await apiClient.PATCH("/contacts/{id}", {
        params: { path: { id } },
        body
      })
      if (error !== undefined || data === undefined) {
        throw toMutationError(response.status, error)
      }

      return data
    },
    onMutate: ({ id, body }) =>
      cache.apply((contacts) =>
        contacts.map((contact) =>
          contact.id === id
            ? // The modification stamp is raised in the preview too — otherwise
              // the list would show the old date until invalidation (ticket 09).
              { ...contact, ...body, updatedAt: new Date().toISOString() }
            : contact
        )
      ),
    onError: (_error, _variables, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}

export const useDeleteContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error, response } = await apiClient.DELETE("/contacts/{id}", {
        params: { path: { id } }
      })
      if (error !== undefined) {
        throw toMutationError(response.status, error)
      }
    },
    onMutate: (id) => cache.apply((contacts) => contacts.filter((contact) => contact.id !== id)),
    onError: (_error, _id, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}
