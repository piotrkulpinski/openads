import { createPaymentIntent as createPaymentIntentCore, createStripeClient } from "@openads/stripe"
import { env } from "~/env"

export const stripe = createStripeClient({
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PLATFORM_FEE_PERCENT: env.STRIPE_PLATFORM_FEE_PERCENT,
})

const stripeConfig = {
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PLATFORM_FEE_PERCENT: env.STRIPE_PLATFORM_FEE_PERCENT,
}

export type CreatePaymentIntentProps = {
  amount: number
  workspaceId: string
  campaignId: string
  stripeConnectId: string
}

export async function createPaymentIntent(props: CreatePaymentIntentProps) {
  return createPaymentIntentCore(stripe, stripeConfig, props)
}
