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

// SVG is intentionally excluded — it can execute JS when rendered via <img>
// from a same-origin asset host. The server-side upload endpoints enforce the
// same allowlist and cap, so keep them in sync through these constants.
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB

export const fileSchema = z
  .instanceof(File)
  .refine(({ size }) => size > 0, "File cannot be empty")
  .refine(({ size }) => size <= MAX_UPLOAD_BYTES, "File size must be 2MB or less")
  .refine(
    ({ type }) => isMimeTypeMatch(type, [...ALLOWED_IMAGE_TYPES]),
    "File must be a PNG, JPEG or WebP image",
  )

export const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/i
export const slugRegex = /^(?:[a-z0-9](-?[a-z0-9])*)?$/i

export const idSchema = z.object({ id: z.string().min(1) })

export const slugSchema = z.string().trim().regex(slugRegex, {
  message: "Slug must contain only lowercase letters and dashes [-]",
})

export const isAllowedSlug = (slug: string) => {
  return !reservedSlugs.includes(slug)
}
