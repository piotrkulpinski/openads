import Stripe from "stripe"
import { env } from "~/env"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})

type CreatePaymentIntentProps = {
  amount: number
  workspaceId: string
  bookingId: string
  stripeConnectId: string
}

export async function createPaymentIntent({
  amount,
  workspaceId,
  bookingId,
  stripeConnectId,
}: CreatePaymentIntentProps) {
  const applicationFeeAmount = Math.round((amount * env.STRIPE_PLATFORM_FEE_PERCENT) / 100)

  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
    application_fee_amount: applicationFeeAmount,
    transfer_data: { destination: stripeConnectId },
    metadata: { workspaceId, bookingId },
  })
}
