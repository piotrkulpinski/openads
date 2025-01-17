import { Button } from "@openads/ui/button"
import { useNavigate } from "@tanstack/react-router"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { DialogConfirm } from "~/components/dialogs/dialog-confirm"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export const DeleteForm = (props: HTMLAttributes<HTMLElement>) => {
  const trpcUtils = trpc.useUtils()
  const { id, slug } = useWorkspace()
  const navigate = useNavigate()

  const { mutate: deleteWorkspace, isPending } = trpc.workspace.delete.useMutation({
    onSuccess: async () => {
      navigate({ to: "/" })

      // Show a success toast
      toast.success("Workspace deleted successfully")

      // Invalidate the workspace list
      await trpcUtils.workspace.getAll.invalidate()
    },
  })

  return (
    <Card className="border-red-200" {...props}>
      <Card.Panel asChild>
        <Header
          title="Delete Workspace"
          description="The will permanently delete the current workspace, including its ad spots and bookings. This action cannot be undone - please proceed with caution."
        />
      </Card.Panel>

      <Card.Row direction="rowReverse" className="border-red-200 bg-red-50">
        <DialogConfirm
          title="Delete your workspace?"
          label="Delete Workspace"
          onConfirm={() => deleteWorkspace({ id })}
          confirmText={slug}
        >
          <Button size="lg" isPending={isPending} variant="destructive">
            Delete Workspace
          </Button>
        </DialogConfirm>
      </Card.Row>
    </Card>
  )
}
