import type { Workspace } from "@openads/db/client"

export const getWorkspaceFaviconUrl = (workspace: Workspace | undefined) => {
  // Empty string means the favicon was never fetched — let the fallback render.
  return workspace?.faviconUrl || undefined
}
