import type { operations } from "../../../generated/api"

export type Task = operations["tasks.list"]["responses"][200]["content"]["application/json"][number]
export type Recurrence = Task["recurrence"]
export type CreateTaskBody = operations["tasks.create"]["requestBody"]["content"]["application/json"]
export type UpdateTaskBody = operations["tasks.update"]["requestBody"]["content"]["application/json"]
export type TaskNotFound = operations["tasks.update"]["responses"][404]["content"]["application/json"]
export type TaskValidationFailure = operations["tasks.update"]["responses"][400]["content"]["application/json"]
export type TaskWriteFailure = TaskNotFound | TaskValidationFailure
