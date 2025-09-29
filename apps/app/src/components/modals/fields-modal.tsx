import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@openads/ui/alert-dialog"
import { type PropsWithChildren, useState } from "react"
import { FieldsHead } from "~/components/fields/fields-head"
import { FieldsList } from "~/components/fields/fields-list"

export const FieldsModal = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent size="xl" className="p-0 gap-0">
        <AlertDialogTitle className="sr-only">Edit Custom Fields</AlertDialogTitle>

        <AlertDialogDescription className="sr-only">
          Manage the custom fields of your ad zone
        </AlertDialogDescription>

        <FieldsHead />
        <FieldsList />
      </AlertDialogContent>
    </AlertDialog>
  )
}
