import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../../../libs/ui/alert-dialog"
import type { Contact } from "../domain/models"
import { contactsCopy } from "./copy"

interface DeleteDialogProps {
  /** The contact to delete; its absence closes the dialog. */
  readonly contact: Contact | undefined
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly onCloseAutoFocus: () => void
}

/**
 * A separate warning dialog — with the name and the role, because an "are you
 * sure?" without a name protects against nothing (spec 0001, story 52). Once
 * confirmed, the deletion is immediate and permanent; the rescue is the undo
 * action in the notification (ADR-0003).
 */
export const DeleteDialog = ({
  contact,
  onOpenChange,
  onConfirm,
  onCloseAutoFocus
}: DeleteDialogProps) => (
  <AlertDialog open={contact !== undefined} onOpenChange={onOpenChange}>
    {contact !== undefined ? (
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseAutoFocus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{contactsCopy.remove.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {contactsCopy.remove.description(contact.name, contact.role)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{contactsCopy.remove.cancel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {contactsCopy.remove.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    ) : null}
  </AlertDialog>
)
