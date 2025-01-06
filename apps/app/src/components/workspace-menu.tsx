import { db } from "@openads/db"
import { headers } from "next/headers"
import { WorkspaceDropdown } from "~/components/workspace-dropdown"
import { auth } from "~/lib/auth/server"

export const WorkspaceMenu = async () => {
  const session = await auth.api.getSession({ headers: await headers() })

  const [workspaces, defaultWorkspace] = await Promise.all([
    db.workspace.findMany({ where: { users: { some: { userId: session?.user.id } } } }),
    db.workspace.findFirst({ where: { defaultFor: { some: { id: session?.user.id } } } }),
  ])

  return <WorkspaceDropdown workspaces={workspaces} defaultWorkspace={defaultWorkspace} />
}
