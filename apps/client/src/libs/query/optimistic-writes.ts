import { useMutation, useQueryClient } from "@tanstack/react-query"

/** What a write's failure body looks like across every module's generated contract. */
interface WriteFailure {
  readonly _tag?: string
  readonly issues?: ReadonlyArray<{ readonly path: ReadonlyArray<unknown>; readonly message: string }>
}

/** What a request comes back with. `openapi-fetch` does not throw — a failure arrives as `error`. */
interface ApiAnswer<TData, TFailure> {
  readonly data?: TData | undefined
  readonly error?: TFailure | undefined
  readonly response: Response
}

/** No content is a legitimate answer — `DELETE` gives back exactly that. */
const NO_CONTENT = 204

/**
 * A write failure in the shape the screen can react to: `notFound` leads to
 * invalidating the list (it is stale), `fieldErrors` go back to individual
 * form fields, everything else becomes a general message.
 */
export class MutationError extends Error {
  constructor(
    message: string,
    readonly notFound: boolean,
    readonly fieldErrors: Partial<Readonly<Record<string, string>>>
  ) {
    super(message)
    this.name = "MutationError"
  }
}

/**
 * One optimistic-write hook, described once per entity. `queryKey` is what
 * gets cancelled/snapshotted/invalidated; `notFoundTag` is the domain error
 * that means the record is gone; `fieldFromPath` turns a validation issue's
 * path into a form field name. Everything else — cancelling in-flight
 * queries, snapshotting the list, showing the preview, rolling it back on
 * failure, invalidating afterwards, translating the response — is identical
 * across every module and lives here once, so create/edit/delete/etc. cannot
 * drift apart between modules the way they did before this file existed.
 */
export const createOptimisticWrites = <TItem, TFailure extends WriteFailure, TField extends string>(config: {
  readonly queryKey: ReadonlyArray<unknown>
  readonly notFoundTag: string
  readonly fieldFromPath: (path: ReadonlyArray<unknown>) => TField | undefined
}) => {
  const toMutationError = (status: number, body: TFailure | undefined): MutationError => {
    if (body?._tag === config.notFoundTag) return new MutationError(`${config.notFoundTag}`, true, {})

    const fieldErrors: Partial<Record<TField, string>> = {}
    for (const issue of body?.issues ?? []) {
      const field = config.fieldFromPath(issue.path)
      if (field !== undefined) fieldErrors[field] ??= issue.message
    }
    return new MutationError(`Request failed (HTTP ${status})`, false, fieldErrors)
  }

  const useOptimisticWrite = <TVariables, TData>(write: {
    readonly send: (variables: TVariables) => Promise<ApiAnswer<TData, TFailure>>
    readonly preview: (items: ReadonlyArray<TItem>, variables: TVariables) => ReadonlyArray<TItem>
  }) => {
    const queryClient = useQueryClient()

    return useMutation<TData, MutationError, TVariables, { readonly previous: ReadonlyArray<TItem> | undefined }>({
      mutationFn: async (variables) => {
        const { data, error, response } = await write.send(variables)
        if (error !== undefined || (data === undefined && response.status !== NO_CONTENT)) {
          throw toMutationError(response.status, error)
        }
        return data as TData
      },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: config.queryKey })
        const previous = queryClient.getQueryData<ReadonlyArray<TItem>>(config.queryKey)
        if (previous !== undefined) queryClient.setQueryData(config.queryKey, write.preview(previous, variables))
        return { previous }
      },
      onError: (_error, _variables, context) => {
        if (context?.previous !== undefined) queryClient.setQueryData(config.queryKey, context.previous)
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: config.queryKey })
      }
    })
  }

  return { MutationError, useOptimisticWrite }
}
