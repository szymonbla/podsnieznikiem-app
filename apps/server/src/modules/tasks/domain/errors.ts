import { Schema } from "effect"

import { TaskId } from "./models.js"

/**
 * The only domain error in the MVP. Declared per endpoint in `HttpApi`, so
 * Effect forces the handler signature to account for it, maps it to a 404 and
 * writes it into OpenAPI — which is how it reaches the client as a typed union
 * (DESIGN.md §8).
 */
export class TaskNotFound extends Schema.TaggedError<TaskNotFound>()("TaskNotFound", {
  id: TaskId
}) {}
