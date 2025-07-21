import { createFileRoute, notFound } from "@tanstack/react-router"
import { WorkspaceContext } from "~/contexts/workspace-context"

export const Route = createFileRoute("/$workspace_/book")({
  beforeLoad: async ({ context, params: { workspace: slug } }) => {
    const workspace = await context.trpcUtils.workspace.getBySlug.fetch({
      slug,
    })

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
