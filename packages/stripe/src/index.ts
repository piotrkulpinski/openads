import Stripe from "stripe"

export interface StripeConfig {
  STRIPE_SECRET_KEY: string
  STRIPE_PLATFORM_FEE_PERCENT: number
}

export function createStripeClient(config: StripeConfig) {
  return new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  })
}

export type StripeClient = ReturnType<typeof createStripeClient>

// Re-export Stripe types for convenience
export * from "stripe"
