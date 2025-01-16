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

          <div className="p-4 flex-1 sm:px-6 lg:px-10 lg:py-8">
            <div className="flex flex-col gap-4 mx-auto w-full max-w-screen-xl">
              <Outlet />
            </div>
          </div>
        </div>
      </WorkspaceContext>
    )
  },
})
