import { z } from "zod"
import { isAllowedSlug, slugSchema } from "../lib/utils"

export const workspaceSchema = z.object({
  // id: z.string().optional(),
  name: z.string().trim().min(3, { message: "Name is too short" }),
  slug: slugSchema
    .min(3, { message: "Slug is too short" })
    .refine(isAllowedSlug, { message: "This slug is reserved" })
    .default(""),
  websiteUrl: z.string().trim().min(1, { message: "URL is required" }).url(),
})

export type WorkspaceSchema = z.infer<typeof workspaceSchema>
