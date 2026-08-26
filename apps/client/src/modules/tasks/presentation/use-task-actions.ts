import { useState } from "react"
import { toast } from "sonner"

import type { TaskFormOutput } from "../configuration/schema"
import type { Task } from "../domain/models"
import { TaskMutationError } from "../integration/optimistic-writes"
import { useCreateTask, useUpdateTask } from "../integration/queries"
import { tasksCopy } from "./copy"

interface TaskActions {
  readonly edited: Task | undefined
  readonly isFormOpen: boolean
  readonly isSaving: boolean
  readonly openCreate: () => void
  readonly openEdit: (task: Task) => void
  readonly setFormOpen: (open: boolean) => void
  readonly submit: (values: TaskFormOutput) => Promise<Readonly<Record<string, string>> | undefined>
  readonly reportFailure: (error: unknown, fallback: string) => Readonly<Record<string, string>> | undefined
}

export const useTaskActions = (): TaskActions => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [edited, setEdited] = useState<Task | undefined>(undefined)

  const create = useCreateTask()
  const update = useUpdateTask()

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
    openCreate: () => { setEdited(undefined); setFormOpen(true) },
    openEdit: (task) => { setEdited(task); setFormOpen(true) },
    setFormOpen,
    reportFailure,
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
    }
  }
}
