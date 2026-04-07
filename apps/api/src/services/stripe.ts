import {
  type CreatePaymentIntentProps,
  createPaymentIntent as createPaymentIntentCore,
  createStripeClient,
} from "@openads/stripe"
import Stripe from "stripe"
import { env } from "~/env"

export const stripe = createStripeClient({
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PLATFORM_FEE_PERCENT: env.STRIPE_PLATFORM_FEE_PERCENT,
})

const stripeConfig = {
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PLATFORM_FEE_PERCENT: env.STRIPE_PLATFORM_FEE_PERCENT,
}

export type { CreatePaymentIntentProps }

export async function createPaymentIntent(
  props: CreatePaymentIntentProps,
): Promise<Stripe.PaymentIntent> {
  return createPaymentIntentCore(stripe, stripeConfig, props)
}
