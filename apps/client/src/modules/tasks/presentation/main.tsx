import { Plus } from "lucide-react"

import { shellCopy } from "../../../core/layouts/copy"
import { Button } from "../../../libs/ui/button"
import { EmptyState } from "../../../libs/ui/empty-state"
import { useTasks } from "../integration/queries"
import { TaskFormDialog } from "./task-form-dialog"
import { TasksTable } from "./tasks-table"
import { tasksCopy } from "./copy"
import { useTaskActions } from "./use-task-actions"
import { useTaskList } from "./use-task-list"

export const TasksScreen = () => {
  const query = useTasks()
  const { state, isReady, rows } = useTaskList(query)
  const actions = useTaskActions()

  return (
    <main id="tresc" className="flex min-w-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 pt-5 pb-4 wide:px-8 wide:pt-[26px] wide:pb-[18px]">
        <h1 className="font-heading text-xl font-bold tracking-[-0.03em] wide:text-2xl">
          <span className="text-ink-faint">{shellCopy.cottage} / </span>
          {tasksCopy.title}
        </h1>
        {isReady ? (
          <Button type="button" onClick={actions.openCreate}>
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
            {tasksCopy.add}
          </Button>
        ) : null}
      </header>

      <div className="flex flex-col gap-[18px] px-4 pt-[18px] pb-12 wide:px-8 wide:pt-[22px] wide:pb-16">
        {state === "loading" ? <p role="status" className="text-muted-foreground">{tasksCopy.loading}</p> : null}
        {state === "error" ? (
          <EmptyState assertive title={tasksCopy.loadError.title} description={tasksCopy.loadError.description}
            action={<Button type="button" onClick={() => void query.refetch()}>{tasksCopy.loadError.action}</Button>} />
        ) : null}
        {state === "empty" ? (
          <EmptyState title={tasksCopy.emptyList.title} description={tasksCopy.emptyList.description}
            action={<Button type="button" onClick={actions.openCreate}>{tasksCopy.emptyList.action}</Button>} />
        ) : null}
        {state === "list" ? <TasksTable tasks={rows} onEdit={actions.openEdit} /> : null}
        {isReady ? <p className="pt-1 text-2xs text-ink-heading">{tasksCopy.autosave}</p> : null}
      </div>

      <TaskFormDialog open={actions.isFormOpen} onOpenChange={actions.setFormOpen}
        {...(actions.edited === undefined ? {} : { task: actions.edited })}
        onSubmit={actions.submit} pending={actions.isSaving} />
    </main>
  )
}
