import type Stripe from "stripe"
import type { StripeClient } from "./index"

export interface CreateCheckoutSessionProps {
  priceId: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  applicationFeePercent: number
  destinationAccountId: string
  metadata: {
    workspaceId: string
    packageId: string
    zoneId: string
  }
}

export async function createSubscriptionCheckoutSession(
  stripe: StripeClient,
  props: CreateCheckoutSessionProps,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: props.priceId, quantity: 1 }],
    customer_email: props.customerEmail,
    success_url: props.successUrl,
    cancel_url: props.cancelUrl,
    subscription_data: {
      application_fee_percent: props.applicationFeePercent,
      transfer_data: { destination: props.destinationAccountId },
      metadata: props.metadata,
    },
    metadata: props.metadata,
    allow_promotion_codes: true,
  })
}
