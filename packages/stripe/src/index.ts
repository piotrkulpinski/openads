import Stripe from "stripe"

export type StripeConfig = {
  STRIPE_SECRET_KEY: string
}

export const createStripeClient = (config: StripeConfig) => {
  return new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
  })
}

export type StripeClient = ReturnType<typeof createStripeClient>
