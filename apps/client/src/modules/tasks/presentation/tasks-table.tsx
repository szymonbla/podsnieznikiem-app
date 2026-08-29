import { Repeat } from "lucide-react"

import { Badge } from "../../../libs/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../libs/ui/table"
import { cn } from "../../../libs/ui/utils"
import { isDraft } from "../domain/drafts"
import type { Task } from "../domain/models"
import { dueDateStamp, recurrenceSummary, tasksCopy } from "./copy"
import { RowMenu } from "./row-menu"

interface TasksTableProps {
  readonly tasks: ReadonlyArray<Task>
  readonly onEdit: (task: Task) => void
  readonly onComplete: (task: Task) => void
  readonly onRemove: (task: Task) => void
}

/**
 * The due-date stamp — the page's signature element. A returning chore is
 * read by *when it's next due*, not by an abstract status word, so the date
 * itself becomes the object the eye lands on: a two-line day/month tile, ink
 * shifting to the destructive palette once the date has passed.
 */
const DueDateStamp = ({ task }: { readonly task: Task }) => {
  const stamp = dueDateStamp(task.dueDate)
  return (
    <div
      aria-label={stamp.full}
      className={cn(
        "inline-flex min-w-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[10px] border px-2 py-1.5",
        task.overdue ? "border-destructive/25 bg-destructive-subtle" : "border-border-soft bg-surface"
      )}
    >
      <span
        className={cn(
          "font-heading text-base leading-none font-bold tracking-[-0.02em] tabular-nums",
          task.overdue ? "text-destructive" : "text-foreground"
        )}
      >
        {stamp.day}
      </span>
      <span className={cn("text-3xs leading-none font-bold tracking-[0.08em]", task.overdue ? "text-destructive" : "text-ink-faint")}>
        {stamp.month}
      </span>
      {task.overdue ? <span className="mt-0.5 text-3xs leading-none font-bold text-destructive">{tasksCopy.overdue}</span> : null}
    </div>
  )
}

export const TasksTable = ({ tasks, onEdit, onComplete, onRemove }: TasksTableProps) => (
  <Table regionLabel={tasksCopy.tableLabel} aria-label={tasksCopy.tableLabel} className="table-fixed border-collapse min-w-[560px]">
    <TableHeader className="[&_tr]:border-0">
      <TableRow className="sticky top-0 z-[5] border-b border-separator bg-background hover:bg-transparent">
        <TableHead scope="col" className="w-[40%]">{tasksCopy.columns.description}</TableHead>
        <TableHead scope="col" className="w-[20%]">{tasksCopy.columns.dueDate}</TableHead>
        <TableHead scope="col" className="w-[28%]">{tasksCopy.columns.recurrence}</TableHead>
        <TableHead scope="col" className="w-11"><span className="sr-only">{tasksCopy.columns.actions}</span></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tasks.map((task) => {
        const draft = isDraft(task)
        return (
          <TableRow key={task.id} className="h-16 border-b border-separator-soft hover:bg-surface-sunken">
            <TableCell className="truncate px-3 py-2.5 font-bold">
              <button type="button" className="text-left" onClick={() => onEdit(task)}>{task.description}</button>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              {draft ? "–" : <DueDateStamp task={task} />}
            </TableCell>
            <TableCell className="px-3 py-2.5">
              {draft ? "–" : (
                <Badge variant="teal" className="max-w-full gap-1">
                  {task.recurrence.type !== "once" ? <Repeat aria-hidden="true" strokeWidth={2} className="size-3 shrink-0" /> : null}
                  <span className="truncate">{recurrenceSummary(task.recurrence)}</span>
                </Badge>
              )}
            </TableCell>
            <TableCell className="px-0 py-2.5 text-right">
              {draft ? null : <RowMenu task={task} onComplete={() => onComplete(task)} onEdit={() => onEdit(task)} onRemove={() => onRemove(task)} />}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
)
