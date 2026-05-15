import { z } from "zod"

export const tierSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is too short" }),
  description: z.string().trim().optional(),
  weight: z.number().positive(),
  isActive: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  features: z
    .array(z.string().trim().min(1, { message: "Feature is empty" }).max(80))
    .max(15, { message: "Up to 15 features per tier" })
    .default([]),
})

export type TierSchema = z.infer<typeof tierSchema>
