import type { CreateTaskBody, Task } from "./models"

export const DRAFT_ID_PREFIX = "draft:"
export const isDraft = (task: Task): boolean => task.id.startsWith(DRAFT_ID_PREFIX)

/**
 * Preview shown before the server confirms a create. `dueDate`/`overdue` are
 * left blank rather than computed here — the client never runs the occurrence
 * math, only the server does (spec 0002 → "Wyznaczanie bieżącego wystąpienia").
 */
export const draftTask = (body: CreateTaskBody): Task => {
  const now = new Date().toISOString()
  return {
    id: `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`,
    ...body,
    completedThrough: null,
    dueDate: "",
    overdue: false,
    done: false,
    createdAt: now,
    updatedAt: now
  }
}
