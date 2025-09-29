import type { Workspace } from "@openads/db/client"
import { getWebsiteFavicon } from "~/lib/helpers"

export const getWorkspaceFaviconUrl = (workspace: Workspace | undefined) => {
  if (!workspace) return undefined

  return workspace.faviconUrl || getWebsiteFavicon(workspace.websiteUrl)
}
