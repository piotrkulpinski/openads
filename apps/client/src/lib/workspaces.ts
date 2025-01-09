import type { Workspace } from "../../../../packages/db/src/client"

export const getWorkspaceFaviconUrl = (workspace: Workspace | undefined) => {
  if (!workspace) return undefined

  const fallbackUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${workspace.websiteUrl}`
  return workspace.faviconUrl ?? fallbackUrl
}