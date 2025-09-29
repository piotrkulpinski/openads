import { isMimeTypeMatch } from "@primoui/utils"
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
  .refine(async ({ size }) => size > 0, "File cannot be empty")
  .refine(async ({ size }) => size < MAX_IMAGE_SIZE_BYTES, "File size must be less than 1MB")
  .refine(async ({ type }) => isMimeTypeMatch(type, ["image/*"]), "File type is not valid")

export const urlSchema = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/i
export const domainNameRegex = /^((\*\.)|((?!-)[a-z0-9-]{0,63}[a-z0-9]\.))+[a-z]{2,63}$/i
export const slugRegex = /^(?:[a-z0-9](-?[a-z0-9])*)?$/i
export const colorRegex = /^#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})$/gi

export const idSchema = z.object({ id: z.string().min(1) })
export const idsSchema = z.object({ ids: z.string().array() })

export const domainNameSchema = z.string().trim().min(3).max(253).regex(domainNameRegex, {
  message: "This must be a valid domain name",
})

export const slugSchema = z.string().trim().regex(slugRegex, {
  message: "Slug must contain only lowercase letters and dashes [-]",
})

export const colorSchema = z.string().trim().regex(colorRegex, {
  message: "Value must be a valid color",
})

export const isAllowedSlug = (slug: string) => {
  return !reservedSlugs.includes(slug)
}
