import { Button } from "@openads/ui/button"
import { useNavigate } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export const DeleteForm = (props: ComponentProps<"div">) => {
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

    onError: error => {
      toast.error(error.message)
    },
  })

  return (
    <Card className="border-red-200 dark:border-red-950" {...props}>
      <Card.Panel asChild>
        <Header>
          <HeaderTitle size="h4">Delete Workspace</HeaderTitle>

          <HeaderDescription>
            The will permanently delete the current workspace, including its ad zones and campaigns.
            This action cannot be undone - please proceed with caution.
          </HeaderDescription>
        </Header>
      </Card.Panel>

      <Card.Row direction="rowReverse" className="border-red-200 bg-red-500/10 dark:border-red-950">
        <ConfirmModal
          title="Delete your workspace?"
          label="Delete Workspace"
          onConfirm={() => deleteWorkspace({ workspaceId: id })}
          confirmText={slug}
        >
          <Button isPending={isPending} variant="destructive">
            Delete Workspace
          </Button>
        </ConfirmModal>
      </Card.Row>
    </Card>
  )
}
