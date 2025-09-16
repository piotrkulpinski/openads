import { z } from "zod"
import { slugSchema } from "./shared"

export const workspaceSchema = z.object({
  // id: z.string().optional(),
  name: z.string().trim().min(3, { message: "Name is too short" }),
  slug: slugSchema.min(3, { message: "Slug is too short" }).default(""),
  websiteUrl: z.url().trim().min(1, { message: "URL is required" }),
})

export type WorkspaceSchema = z.infer<typeof workspaceSchema>
