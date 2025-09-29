import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router"
import { Sidebar, SidebarSkeleton } from "~/components/sidebar"
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

  component: WorkspaceLayout,
  pendingComponent: WorkspaceLayoutPending,
})

function WorkspaceLayoutPending() {
  return (
    <div className="flex items-stretch size-full">
      <SidebarSkeleton />

      <main className="flex-1 min-w-xl p-4 sm:px-6 lg:px-10 lg:py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Skeleton className="h-7 max-w-40" />
          <Skeleton className="h-[32rem]" />
        </div>
      </main>
    </div>
  )
}

function WorkspaceLayout() {
  const routeContext = Route.useRouteContext()
  const workspace = routeContext?.workspace

  if (!workspace) {
    return <WorkspaceLayoutPending />
  }

  return (
    <WorkspaceContext value={workspace}>
      <div className="flex items-stretch size-full">
        <Sidebar />

        <div className="p-4 flex-1 min-w-xl sm:px-6 lg:px-10 lg:py-6">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </div>
      </div>
    </WorkspaceContext>
  )
}
