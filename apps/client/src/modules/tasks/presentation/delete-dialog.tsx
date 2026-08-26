import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../libs/ui/alert-dialog"
import type { Task } from "../domain/models"
import { tasksCopy } from "./copy"

interface DeleteDialogProps {
  readonly task: Task | undefined
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export const DeleteDialog = ({ task, onOpenChange, onConfirm }: DeleteDialogProps) => (
  <AlertDialog open={task !== undefined} onOpenChange={onOpenChange}>
    {task !== undefined ? (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tasksCopy.remove.title}</AlertDialogTitle>
          <AlertDialogDescription>{tasksCopy.remove.description(task.description)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tasksCopy.remove.cancel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>{tasksCopy.remove.confirm}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    ) : null}
  </AlertDialog>
)
