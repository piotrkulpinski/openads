import { z } from "zod"
import { isAllowedSlug, slugSchema } from "../lib/utils"

export const workspaceSchema = z.object({
  name: z.string().min(3, { message: "Name is too short" }),
  slug: slugSchema
    .min(3, { message: "Slug is too short" })
    .refine(isAllowedSlug, { message: "This slug is reserved" }),
  websiteUrl: z.string().min(1, { message: "URL is required" }).url({ message: "Invalid URL" }),
})
