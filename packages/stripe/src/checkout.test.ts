import { describe, expect, it } from "bun:test"
import { createSubscriptionCheckoutSession } from "./checkout"
import type { StripeClient } from "./index"

describe("createSubscriptionCheckoutSession", () => {
  it("creates a connected-account subscription checkout with an application fee", async () => {
    const calls: Array<unknown> = []
    const stripe = {
      checkout: {
        sessions: {
          create: (...args: Array<unknown>) => {
            calls.push(args)
            return Promise.resolve({ id: "cs_test_direct" })
          },
        },
      },
    } as unknown as StripeClient

    await createSubscriptionCheckoutSession(stripe, {
      connectedAccountId: "acct_publisher",
      priceId: "price_ads_monthly",
      customerEmail: "sponsor@example.com",
      successUrl:
        "https://app.openads.test/advertise/success?workspace_id=ws_123&session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://app.openads.test/advertise/cancelled",
      applicationFeePercent: 5,
      metadata: {
        workspaceId: "ws_123",
        tierId: "tier_gold",
        tierPriceId: "tier_price_monthly",
      },
    })

    expect(calls).toEqual([
      [
        {
          mode: "subscription",
          line_items: [{ price: "price_ads_monthly", quantity: 1 }],
          customer_email: "sponsor@example.com",
          success_url:
            "https://app.openads.test/advertise/success?workspace_id=ws_123&session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "https://app.openads.test/advertise/cancelled",
          client_reference_id: "ws_123",
          subscription_data: {
            application_fee_percent: 5,
            metadata: {
              workspaceId: "ws_123",
              tierId: "tier_gold",
              tierPriceId: "tier_price_monthly",
            },
          },
          metadata: {
            workspaceId: "ws_123",
            tierId: "tier_gold",
            tierPriceId: "tier_price_monthly",
          },
          allow_promotion_codes: true,
        },
        { stripeAccount: "acct_publisher" },
      ],
    ])
  })
})
