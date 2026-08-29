import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

import { TaskNotFound } from "../domain/errors.js"
import { CreateTaskBody, TaskId, TaskView, UpdateTaskBody } from "../domain/models.js"

/** Path parameter for operations on a single task. */
const idParam = Schema.Struct({ id: TaskId })

export const tasksGroup = HttpApiGroup.make("tasks")
  .add(
    HttpApiEndpoint.get("list", "/tasks")
      .addSuccess(Schema.Array(TaskView))
      .annotate(OpenApi.Description, "Every task, with dueDate/overdue/done computed against today")
  )
  .add(
    HttpApiEndpoint.post("create", "/tasks")
      .setPayload(CreateTaskBody)
      .addSuccess(TaskView, { status: 201 })
      .annotate(OpenApi.Description, "Creates a task from a description and a recurrence rule")
  )
  .add(
    HttpApiEndpoint.patch("update", "/tasks/:id")
      .setPath(idParam)
      .setPayload(UpdateTaskBody)
      .addSuccess(TaskView)
      .addError(TaskNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Updates the description and/or the whole recurrence rule")
  )
  .add(
    HttpApiEndpoint.del("remove", "/tasks/:id")
      .setPath(idParam)
      .addError(TaskNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Deletes a task permanently")
  )
  .add(
    HttpApiEndpoint.post("complete", "/tasks/:id/complete")
      .setPath(idParam)
      .addSuccess(TaskView)
      .addError(TaskNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Marks the current occurrence done, computed against today")
  )
  .add(
    HttpApiEndpoint.post("uncomplete", "/tasks/:id/uncomplete")
      .setPath(idParam)
      .addSuccess(TaskView)
      .addError(TaskNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Clears the completed marker")
  )
  .annotate(OpenApi.Title, "Tasks")
