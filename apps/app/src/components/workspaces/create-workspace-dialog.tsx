import { Button } from "@openads/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@openads/ui/dialog"
import { type PropsWithChildren, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"

export const CreateWorkspaceDialog = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const [isOpen, onOpenChange] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[455px]">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            For example, you can use the name of your company or department.
          </DialogDescription>
        </DialogHeader>

        <CreateWorkspaceForm
          onSuccess={({ slug }) => {
            toast.success("Workspace created successfully")
            navigate(`/${slug}`)
          }}
        >
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </CreateWorkspaceForm>
      </DialogContent>
    </Dialog>
  )
}
