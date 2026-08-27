import { useState } from "react"
import { toast } from "sonner"

import { UNDO_WINDOW_MS } from "../configuration/query-settings"
import type { TaskFormOutput } from "../configuration/schema"
import type { CreateTaskBody, Task } from "../domain/models"
import { TaskMutationError } from "../integration/optimistic-writes"
import { useCompleteTask, useCreateTask, useDeleteTask, useUncompleteTask, useUpdateTask } from "../integration/queries"
import { tasksCopy } from "./copy"

interface TaskActions {
  readonly edited: Task | undefined
  readonly isFormOpen: boolean
  readonly isSaving: boolean
  readonly removed: Task | undefined
  readonly openCreate: () => void
  readonly openEdit: (task: Task) => void
  readonly setFormOpen: (open: boolean) => void
  readonly submit: (values: TaskFormOutput) => Promise<Partial<Readonly<Record<string, string>>> | undefined>
  readonly askRemove: (task: Task) => void
  readonly cancelRemove: () => void
  readonly confirmRemove: () => void
  readonly complete: (task: Task) => void
}

export const useTaskActions = (): TaskActions => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [edited, setEdited] = useState<Task | undefined>(undefined)

  const create = useCreateTask()
  const update = useUpdateTask()
  const remove = useDeleteTask()
  const complete = useCompleteTask()
  const uncomplete = useUncompleteTask()
  const [removed, setRemoved] = useState<Task | undefined>(undefined)

  const bodyOf = (task: Task): CreateTaskBody => ({ description: task.description, recurrence: task.recurrence })

  const restore = (task: Task) => {
    create.mutate(bodyOf(task), {
      onSuccess: () => toast.success(tasksCopy.remove.restored(task.description)),
      onError: () => toast.error(tasksCopy.remove.restoreFailed)
    })
  }

  const undoComplete = (task: Task) => {
    uncomplete.mutate(task.id, {
      onSuccess: () => toast.success(tasksCopy.row.uncompleted(task.description)),
      onError: () => toast.error(tasksCopy.row.uncompleteFailed)
    })
  }

  const reportFailure = (error: unknown, fallback: string) => {
    if (error instanceof TaskMutationError) {
      if (error.notFound) {
        toast.error(tasksCopy.notFound)
        setFormOpen(false)
        return undefined
      }
      if (Object.keys(error.fieldErrors).length > 0) return error.fieldErrors
    }
    toast.error(fallback)
    return undefined
  }

  return {
    edited, isFormOpen, isSaving: create.isPending || update.isPending,
    removed,
    openCreate: () => { setEdited(undefined); setFormOpen(true) },
    openEdit: (task) => { setEdited(task); setFormOpen(true) },
    setFormOpen,
    submit: async (values) => {
      const target = edited
      try {
        if (target === undefined) {
          const created = await create.mutateAsync(values)
          toast.success(tasksCopy.form.create.success(created.description))
        } else {
          const saved = await update.mutateAsync({ id: target.id, body: values })
          toast.success(tasksCopy.form.edit.success(saved.description))
        }
        setFormOpen(false)
        return undefined
      } catch (error) {
        return reportFailure(error, target === undefined ? tasksCopy.form.create.failure : tasksCopy.form.edit.failure)
      }
    },
    askRemove: setRemoved,
    cancelRemove: () => setRemoved(undefined),
    confirmRemove: () => {
      const task = removed
      if (task === undefined) return
      setRemoved(undefined)
      remove.mutate(task.id, {
        onSuccess: () => {
          toast.success(tasksCopy.remove.success(task.description), {
            duration: UNDO_WINDOW_MS,
            action: { label: tasksCopy.remove.undo, onClick: () => restore(task) }
          })
        },
        onError: (error) => reportFailure(error, tasksCopy.remove.failure)
      })
    },
    complete: (task: Task) => {
      complete.mutate(task.id, {
        onSuccess: () => {
          toast.success(tasksCopy.row.completed(task.description), {
            duration: UNDO_WINDOW_MS,
            action: { label: tasksCopy.row.undo, onClick: () => undoComplete(task) }
          })
        },
        onError: (error) => reportFailure(error, tasksCopy.row.completeFailed)
      })
    }
  }
}
