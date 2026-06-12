import { Button } from "@openads/ui/button"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"
import { orpc, queryClient } from "~/lib/orpc"

export const DeleteWorkspaceCard = (props: ComponentProps<"div">) => {
  const { id, slug } = useWorkspace()
  const navigate = useNavigate()

  const { mutate: deleteWorkspace, isPending } = useMutation(
    orpc.workspace.delete.mutationOptions({
      onSuccess: async () => {
        navigate({ to: "/" })

        toast.success("Workspace deleted successfully")

        // Remove the deleted workspace from menus and workspace selectors.
        await queryClient.invalidateQueries({ queryKey: orpc.workspace.getAll.key() })
      },

      onError: error => {
        toast.error(error.message)
      },
    }),
  )

  return (
    <Card className="border-red-200 dark:border-red-950" {...props}>
      <Card.Panel asChild>
        <Header>
          <HeaderTitle size="h4">Delete Workspace</HeaderTitle>

          <HeaderDescription>
            This will permanently delete the current workspace, including its tiers, fields, and
            ads. This action cannot be undone — please proceed with caution.
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
