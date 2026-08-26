import { Badge } from "../../../libs/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../libs/ui/table"
import { isDraft } from "../domain/drafts"
import type { Task } from "../domain/models"
import { formatDueDate, recurrenceSummary, tasksCopy } from "./copy"
import { RowMenu } from "./row-menu"

interface TasksTableProps {
  readonly tasks: ReadonlyArray<Task>
  readonly onEdit: (task: Task) => void
  readonly onComplete: (task: Task) => void
  readonly onRemove: (task: Task) => void
}

export const TasksTable = ({ tasks, onEdit, onComplete, onRemove }: TasksTableProps) => (
  <Table regionLabel={tasksCopy.tableLabel} aria-label={tasksCopy.tableLabel} className="table-fixed border-collapse min-w-[560px]">
    <TableHeader className="[&_tr]:border-0">
      <TableRow className="sticky top-0 z-[5] border-b border-separator bg-background hover:bg-transparent">
        <TableHead scope="col" className="w-[46%]">{tasksCopy.columns.description}</TableHead>
        <TableHead scope="col" className="w-[22%]">{tasksCopy.columns.dueDate}</TableHead>
        <TableHead scope="col" className="w-[26%]">{tasksCopy.columns.recurrence}</TableHead>
        <TableHead scope="col" className="w-11"><span className="sr-only">{tasksCopy.columns.actions}</span></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tasks.map((task) => (
        <TableRow key={task.id} className="h-14 border-b border-separator-soft hover:bg-surface-sunken">
          <TableCell className="truncate px-3 py-2.5 font-bold">
            <button type="button" className="text-left" onClick={() => onEdit(task)}>{task.description}</button>
          </TableCell>
          <TableCell className="px-3 py-2.5">
            {isDraft(task) ? "–" : (
              <span className="flex items-center gap-2">
                {formatDueDate(task.dueDate)}
                {task.overdue ? <Badge variant="destructive">{tasksCopy.overdue}</Badge> : null}
              </span>
            )}
          </TableCell>
          <TableCell className="px-3 py-2.5">
            {isDraft(task) ? "–" : <Badge variant="teal">{recurrenceSummary(task.recurrence)}</Badge>}
          </TableCell>
          <TableCell className="px-0 py-2.5 text-right">
            {isDraft(task) ? null : <RowMenu task={task} onComplete={() => onComplete(task)} onEdit={() => onEdit(task)} onRemove={() => onRemove(task)} />}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
