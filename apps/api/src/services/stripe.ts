import { createStripeClient } from "@openads/stripe"
import { env } from "~/env"

export const stripe = createStripeClient({
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PLATFORM_FEE_PERCENT: env.STRIPE_PLATFORM_FEE_PERCENT,
})
