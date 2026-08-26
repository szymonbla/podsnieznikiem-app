import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TASKS_QUERY_KEY } from "../configuration/query-settings"
import { taskFormFieldFromPath, type TaskFormField } from "../configuration/schema"
import type { Task, TaskWriteFailure } from "../domain/models"

export class TaskMutationError extends Error {
  constructor(
    message: string,
    readonly notFound: boolean,
    readonly fieldErrors: Partial<Readonly<Record<TaskFormField, string>>>
  ) {
    super(message)
    this.name = "TaskMutationError"
  }
}

const assertHandled = (tag: "TaskNotFound"): void => void tag

const toMutationError = (status: number, body: TaskWriteFailure | undefined): TaskMutationError => {
  if (body?._tag === "TaskNotFound") {
    assertHandled(body._tag)
    return new TaskMutationError("Task does not exist", true, {})
  }

  const fieldErrors: Partial<Record<TaskFormField, string>> = {}
  for (const issue of body?.issues ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = taskFormFieldFromPath(issue.path as any)
    if (field !== undefined) fieldErrors[field] ??= issue.message
  }
  return new TaskMutationError(`Request failed (HTTP ${status})`, false, fieldErrors)
}

interface ApiAnswer<TData> {
  readonly data?: TData | undefined
  readonly error?: TaskWriteFailure | undefined
  readonly response: Response
}
interface Snapshot { readonly previous: ReadonlyArray<Task> | undefined }
const NO_CONTENT = 204

export const useOptimisticWrite = <TVariables, TData>(write: {
  readonly send: (variables: TVariables) => Promise<ApiAnswer<TData>>
  readonly preview: (tasks: ReadonlyArray<Task>, variables: TVariables) => ReadonlyArray<Task>
}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TaskMutationError, TVariables, Snapshot>({
    mutationFn: async (variables) => {
      const { data, error, response } = await write.send(variables)
      if (error !== undefined || (data === undefined && response.status !== NO_CONTENT)) {
        throw toMutationError(response.status, error)
      }
      return data as TData
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY })
      const previous = queryClient.getQueryData<ReadonlyArray<Task>>(TASKS_QUERY_KEY)
      if (previous !== undefined) queryClient.setQueryData(TASKS_QUERY_KEY, write.preview(previous, variables))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(TASKS_QUERY_KEY, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
    }
  })
}
