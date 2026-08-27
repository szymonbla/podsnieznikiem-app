import { createOptimisticWrites } from "../../../libs/query/optimistic-writes"
import { TASKS_QUERY_KEY } from "../configuration/query-settings"
import { taskFormFieldFromPath, type TaskFormField } from "../configuration/schema"
import type { Task, TaskWriteFailure } from "../domain/models"

const { MutationError: TaskMutationError, useOptimisticWrite } = createOptimisticWrites<
  Task,
  TaskWriteFailure,
  TaskFormField
>({
  queryKey: TASKS_QUERY_KEY,
  notFoundTag: "TaskNotFound",
  fieldFromPath: taskFormFieldFromPath
})

export { TaskMutationError, useOptimisticWrite }
