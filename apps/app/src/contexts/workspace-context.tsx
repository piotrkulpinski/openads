import type { Workspace } from "@openads/db/client"
import { createContext, use } from "react"

// biome-ignore lint: non-null assertion
export const WorkspaceContext = createContext<Workspace>(null!)

export const useWorkspace = () => use(WorkspaceContext)
