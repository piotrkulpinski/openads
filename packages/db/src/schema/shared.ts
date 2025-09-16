import { z } from "zod"

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
