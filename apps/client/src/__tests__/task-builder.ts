import type { Task } from "../modules/tasks"

let sequence = 0

export const aTask = (overrides: Partial<Task> = {}): Task => {
  sequence += 1
  return {
    id: `00000000-0000-4000-9000-${String(sequence).padStart(12, "0")}`,
    description: "Przegląd pieca",
    recurrence: { type: "once", date: "2026-12-01" },
    completedThrough: null,
    dueDate: "2026-12-01",
    overdue: false,
    done: false,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides
  }
}
