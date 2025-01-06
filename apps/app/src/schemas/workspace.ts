import { z } from "zod"

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  websiteUrl: z.string().min(1, { message: "URL is required" }).url({ message: "Invalid URL" }),
})

export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

export const changeWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, { message: "Workspace ID is required" }),
  redirectTo: z.string(),
})

export type ChangeWorkspaceSchema = z.infer<typeof changeWorkspaceSchema>
