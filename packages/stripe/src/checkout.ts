import type Stripe from "stripe"
import type { StripeClient } from "./index"

export interface CreateCheckoutSessionProps {
  connectedAccountId: string
  priceId: string
  /** Pre-fills the Stripe Checkout email field. Omit to let Stripe collect it. */
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  applicationFeePercent: number
  metadata: {
    workspaceId: string
    tierId: string
    tierPriceId: string
  }
}

export async function createSubscriptionCheckoutSession(
  stripe: StripeClient,
  props: CreateCheckoutSessionProps,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [{ price: props.priceId, quantity: 1 }],
      customer_email: props.customerEmail,
      success_url: props.successUrl,
      cancel_url: props.cancelUrl,
      client_reference_id: props.metadata.workspaceId,
      subscription_data: {
        application_fee_percent: props.applicationFeePercent,
        metadata: props.metadata,
      },
      metadata: props.metadata,
      allow_promotion_codes: true,
    },
    { stripeAccount: props.connectedAccountId },
  )
}
