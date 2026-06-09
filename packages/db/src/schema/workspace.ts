import { addProtocol } from "@dirstack/utils"
import { z } from "zod"
import { isAllowedSlug, slugSchema, urlRegex } from "./shared"

export const workspaceSchema = z.object({
  name: z.string().trim().min(3, { message: "Name is too short" }),
  slug: slugSchema
    .min(3, { message: "Slug is too short" })
    .refine(isAllowedSlug, { message: "This slug is reserved" }),
  websiteUrl: z
    .string()
    .regex(urlRegex, { message: "Invalid URL format" })
    .transform(url => addProtocol(url)),
})

export type WorkspaceSchema = z.infer<typeof workspaceSchema>
