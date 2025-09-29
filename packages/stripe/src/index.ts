import Stripe from "stripe"

export interface StripeConfig {
  STRIPE_SECRET_KEY: string
  STRIPE_PLATFORM_FEE_PERCENT: number
}

export function createStripeClient(config: StripeConfig) {
  return new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  })
}

export type StripeClient = ReturnType<typeof createStripeClient>

export interface CreatePaymentIntentProps {
  amount: number
  workspaceId: string
  campaignId: string
  stripeConnectId: string
}

export async function createPaymentIntent(
  stripe: StripeClient,
  config: StripeConfig,
  props: CreatePaymentIntentProps,
) {
  const { amount, workspaceId, campaignId, stripeConnectId } = props
  const applicationFeeAmount = Math.round((amount * config.STRIPE_PLATFORM_FEE_PERCENT) / 100)

  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
    application_fee_amount: applicationFeeAmount,
    transfer_data: { destination: stripeConnectId },
    metadata: { workspaceId, campaignId },
  })
}

// Re-export Stripe types for convenience
export * from "stripe"
