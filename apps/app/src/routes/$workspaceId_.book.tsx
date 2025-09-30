import { createFileRoute, notFound } from "@tanstack/react-router"
import { WorkspaceContext } from "~/contexts/workspace-context"

export const Route = createFileRoute("/$workspaceId_/book")({
  beforeLoad: async ({ context, params: { workspaceId } }) => {
    const workspace = await context.trpcUtils.workspace.getById.fetch({ id: workspaceId })

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
