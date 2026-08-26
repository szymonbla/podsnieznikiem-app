import { useMemo } from "react"

import type { Task } from "../domain/models"
import { isReady, screenState, type ScreenState } from "../domain/screen-state"

export interface TasksQuery {
  readonly data: ReadonlyArray<Task> | undefined
  readonly isPending: boolean
  readonly isError: boolean
}

const compareByDueDate = (a: Task, b: Task): number =>
  a.dueDate === b.dueDate ? a.description.localeCompare(b.description, "pl") : a.dueDate < b.dueDate ? -1 : 1

export const useTaskList = (query: TasksQuery): { state: ScreenState; isReady: boolean; rows: ReadonlyArray<Task> } => {
  const tasks = query.data ?? []
  const rows = useMemo(
    () => [...tasks.filter((task) => !task.done)].sort(compareByDueDate),
    [tasks]
  )
  const state = screenState({ isPending: query.isPending, isError: query.isError, total: rows.length })
  return { state, isReady: isReady(state), rows }
}
