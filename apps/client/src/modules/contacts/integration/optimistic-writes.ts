import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CONTACTS_QUERY_KEY } from "../configuration/query-settings"
import { isContactField } from "../configuration/schema"
import type { Contact, ContactField, ContactWriteFailure } from "../domain/models"

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

  return new ContactMutationError(`Request failed (HTTP ${status})`, false, fieldErrors)
}

/**
 * What a request to the contacts API comes back with. `openapi-fetch` does not
 * throw — a failure arrives as `error`, so the caller hands the whole answer
 * over and this module decides what it means.
 */
interface ApiAnswer<TData> {
  readonly data?: TData | undefined
  readonly error?: ContactWriteFailure | undefined
  readonly response: Response
}

/** The list as it stood before the preview — the only thing a rollback needs. */
interface Snapshot {
  readonly previous: ReadonlyArray<Contact> | undefined
}

/** No content is a legitimate answer — `DELETE` gives back exactly that. */
const NO_CONTENT = 204

/**
 * One optimistic write, described once. The caller says two things: what to
 * send, and how the list looks in the meantime. Cancelling in-flight queries,
 * snapshotting the list, showing the preview, rolling it back on failure,
 * invalidating afterwards and translating the error response all live here —
 * so create, edit and delete cannot drift apart (DESIGN.md §9).
 */
export const useOptimisticWrite = <TVariables, TData>(write: {
  readonly send: (variables: TVariables) => Promise<ApiAnswer<TData>>
  readonly preview: (
    contacts: ReadonlyArray<Contact>,
    variables: TVariables
  ) => ReadonlyArray<Contact>
}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, ContactMutationError, TVariables, Snapshot>({
    mutationFn: async (variables) => {
      const { data, error, response } = await write.send(variables)
      if (error !== undefined || (data === undefined && response.status !== NO_CONTENT)) {
        throw toMutationError(response.status, error)
      }

      return data as TData
    },

    onMutate: async (variables) => {
      /* Cancels in-flight queries so an answer on the wire cannot overwrite the preview. */
      await queryClient.cancelQueries({ queryKey: CONTACTS_QUERY_KEY })
      const previous = queryClient.getQueryData<ReadonlyArray<Contact>>(CONTACTS_QUERY_KEY)
      if (previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, write.preview(previous, variables))
      }

      return { previous }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    }
  })
}
