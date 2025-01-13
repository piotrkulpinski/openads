import { Outlet, useParams } from "react-router"
import NotFound from "~/app/not-found"
import { Sidebar } from "~/components/sidebar"
import { WorkspaceContext } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export default function DashboardLayout() {
  const { workspace: slug } = useParams() as { workspace: string }

  // TODO: Fix the checks here
  const { data, isPending, isError } = trpc.workspace.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  )

  if (isPending) {
    return null
  }

  if (isError || !data) {
    return <NotFound />
  }

  return (
    <WorkspaceContext value={data}>
      <div className="flex items-stretch size-full">
        <Sidebar />

        <div className="grid grid-cols-1 content-start gap-4 p-4 flex-1 sm:px-6">
          <Outlet />
        </div>
      </div>
    </WorkspaceContext>
  )
}
