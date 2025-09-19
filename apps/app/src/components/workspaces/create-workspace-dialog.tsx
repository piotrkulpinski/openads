import { Button } from "@openads/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@openads/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { type PropsWithChildren, useState } from "react"
import { toast } from "sonner"
import { HeaderDescription, HeaderRoot, HeaderTitle } from "~/components/ui/header"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"

export const CreateWorkspaceDialog = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const [isOpen, onOpenChange] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[455px]">
        <HeaderRoot>
          <DialogTitle asChild>
            <HeaderTitle size="h4">Create workspace</HeaderTitle>
          </DialogTitle>

          <DialogDescription asChild>
            <HeaderDescription>
              Please provide a website URL and a name for this workspace. Usually, this is your
              product name.
            </HeaderDescription>
          </DialogDescription>
        </HeaderRoot>

        <CreateWorkspaceForm
          onSuccess={({ slug }) => {
            toast.success("Workspace created successfully")
            navigate({ to: "/$workspace", params: { workspace: slug } })
          }}
        >
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </CreateWorkspaceForm>
      </DialogContent>
    </Dialog>
  )
}
