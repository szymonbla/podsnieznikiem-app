import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "../../../libs/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../libs/ui/dropdown-menu"
import type { Task } from "../domain/models"
import { tasksCopy } from "./copy"

interface RowMenuProps {
  readonly task: Task
  readonly onComplete: () => void
  readonly onEdit: () => void
  readonly onRemove: () => void
}

export const RowMenu = ({ task, onComplete, onEdit, onRemove }: RowMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="ghost" size="icon" aria-label={tasksCopy.row.menu(task.description)}>
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onComplete}>
        <Check aria-hidden="true" strokeWidth={1.9} />
        {tasksCopy.row.complete}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onEdit}>
        <Pencil aria-hidden="true" strokeWidth={1.9} />
        {tasksCopy.row.edit}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onSelect={onRemove}>
        <Trash2 aria-hidden="true" strokeWidth={1.9} />
        {tasksCopy.row.remove}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
