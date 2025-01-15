import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { Sidebar } from "~/components/sidebar"
import { WorkspaceContext } from "~/contexts/workspace-context"

export const Route = createFileRoute("/$workspace")({
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

    return (
      <WorkspaceContext value={workspace}>
        <div className="flex items-stretch size-full">
          <Sidebar />

          <div className="grid grid-cols-1 content-start gap-4 p-4 flex-1 sm:px-6">
            <Outlet />
          </div>
        </div>
      </WorkspaceContext>
    )
  },
})
