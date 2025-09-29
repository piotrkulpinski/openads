import { addProtocol } from "@primoui/utils"
import { z } from "zod"
import { isAllowedSlug, slugSchema, urlSchema } from "./shared"

export const workspaceSchema = z.object({
  // id: z.string().optional(),
  name: z.string().trim().min(3, { message: "Name is too short" }),
  slug: slugSchema
    .min(3, { message: "Slug is too short" })
    .refine(isAllowedSlug, { message: "This slug is reserved" }),
  websiteUrl: z
    .string()
    // Validate that it's a valid URL
    .regex(urlSchema, { message: "Invalid URL format" })
    // Add protocol if missing
    .transform(url => addProtocol(url)),
})

export type WorkspaceSchema = z.infer<typeof workspaceSchema>
