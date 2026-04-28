import { z } from "zod"

export const packageSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is too short" }),
  description: z.string().trim().optional(),
  weight: z.number().positive(),
  priceMonthly: z.number().int().nonnegative(),
  currency: z.string().default("usd"),
  isActive: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  zoneId: z.string().nonempty("Zone is required"),
})

export type PackageSchema = z.infer<typeof packageSchema>
