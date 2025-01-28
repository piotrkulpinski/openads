import type { Workspace } from "@openads/db/client"
import { createContext, use } from "react"

export const WorkspaceContext = createContext<Workspace>(null!)

export const useWorkspace = () => use(WorkspaceContext)
