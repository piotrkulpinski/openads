import { z } from "zod"
import { BillingInterval } from "../client"

// `amount` is in CENTS. The form collects whole units (integer) and multiplies
// by 100 before submitting; readers like `formatPrice` divide by 100. DB + Stripe
// both see cents.
export const tierPriceSchema = z.object({
  interval: z.enum(BillingInterval),
  intervalCount: z.number().int().positive().default(1),
  amount: z.number().int().nonnegative(),
  currency: z.string().trim().toLowerCase().length(3).default("usd"),
})

export type TierPriceSchema = z.infer<typeof tierPriceSchema>
