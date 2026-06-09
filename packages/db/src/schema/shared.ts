import { isMimeTypeMatch } from "@dirstack/utils"
import { z } from "zod"

export const reservedSlugs = [
  "app",
  "admin",
  "auth",
  "console",
  "staging",
  "checkout",
  "feedback",
  "root",
  "blog",
  "cms",
  "demo",
  "docs",
  "test",
  "settings",
  "analytics",
  "status",
  "mail",
  "email",
  "host",
  "www",
]

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024

export const fileSchema = z
  .instanceof(File)
  .refine(({ size }) => size > 0, "File cannot be empty")
  .refine(({ size }) => size < MAX_IMAGE_SIZE_BYTES, "File size must be less than 1MB")
  .refine(({ type }) => isMimeTypeMatch(type, ["image/*"]), "File type is not valid")

export const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/i
export const slugRegex = /^(?:[a-z0-9](-?[a-z0-9])*)?$/i

export const idSchema = z.object({ id: z.string().min(1) })

export const slugSchema = z.string().trim().regex(slugRegex, {
  message: "Slug must contain only lowercase letters and dashes [-]",
})

export const isAllowedSlug = (slug: string) => {
  return !reservedSlugs.includes(slug)
}
