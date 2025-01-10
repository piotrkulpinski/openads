import { Navigate } from "react-router"
import { trpc } from "~/lib/trpc"

export default function HomePage() {
  const utils = trpc.useUtils()
  const [user, workspaces] = trpc.useQueries(t => [t.user.me(), t.workspace.getAll()])

  const changeDefaultWorkspace = trpc.workspace.changeDefault.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate()
    },
  })

  // Wait for both queries to complete
  if (!user.isSuccess || !workspaces.isSuccess) {
    return null
  }

  // If user has default workspace, redirect to it
  if (user.data.defaultWorkspace) {
    return <Navigate to={`/${user.data.defaultWorkspace.slug}`} replace />
  }

  // If user has workspaces but no default, set the first one as default
  if (workspaces.data[0]) {
    changeDefaultWorkspace.mutate({ workspaceId: workspaces.data[0].id })
    return <Navigate to={`/${workspaces.data[0].slug}`} replace />
  }

  // No workspaces, redirect to onboarding
  return <Navigate to="/onboarding" replace />
}
