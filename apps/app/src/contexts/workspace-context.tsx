import type { Workspace } from "@openads/db/client"
import { createContext, use } from "react"

export const WorkspaceContext = createContext<Workspace | null>(null)

export const useWorkspace = () => {
  const workspace = use(WorkspaceContext)
  if (!workspace) throw new Error("useWorkspace must be used within WorkspaceContext")
  return workspace
}
