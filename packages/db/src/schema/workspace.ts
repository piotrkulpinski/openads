import { z } from "zod"
import { isAllowedSlug, slugSchema } from "../lib/utils"

export const workspaceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: slugSchema.min(3).refine(isAllowedSlug, { message: "This slug is reserved" }).default(""),
  websiteUrl: z.string().min(1, { message: "URL is required" }).url({ message: "Invalid URL" }),
})
