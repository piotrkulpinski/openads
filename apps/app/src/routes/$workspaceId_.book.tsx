import { createFileRoute, notFound } from "@tanstack/react-router"
import { WorkspaceContext } from "~/contexts/workspace-context"

export const Route = createFileRoute("/$workspaceId_/book")({
  beforeLoad: async ({ context: { trpc }, params: { workspaceId } }) => {
    const workspace = await trpc.workspace.getById.fetch({ id: workspaceId })

    if (!workspace) {
      throw notFound()
    }

    return { workspace }
  },

  component: () => {
    const { workspace } = Route.useRouteContext()

    return <WorkspaceContext value={workspace}>Book</WorkspaceContext>
  },
})
