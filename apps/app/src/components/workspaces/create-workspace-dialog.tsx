import { Button } from "@openads/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@openads/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { type PropsWithChildren, useState } from "react"
import { toast } from "sonner"
import { Header } from "~/components/ui/header"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"

export const CreateWorkspaceDialog = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const [isOpen, onOpenChange] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[455px]">
        <DialogTitle asChild>
          <Header
            size="h4"
            title="Create workspace"
            description="For example, you can use the name of your company or department."
          >
            <DialogClose />
          </Header>
        </DialogTitle>

        <CreateWorkspaceForm
          onSuccess={({ slug }) => {
            toast.success("Workspace created successfully")
            navigate({ to: "/$workspace", params: { workspace: slug } })
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
