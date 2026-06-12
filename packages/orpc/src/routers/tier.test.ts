import { describe, expect, it } from "bun:test"
import { ORPCError } from "@orpc/server"
import type { Context } from "../index"
import { tierRouter } from "./tier"

const createContext = ({
  tierPrice = {
    id: "tier_price_monthly",
    stripePriceId: "price_monthly",
    isActive: true,
    tier: {
      id: "tier_gold",
      isActive: true,
      workspace: {
        id: "ws_openads",
        stripeConnectStatus: "Active",
        stripeConnectId: "acct_publisher",
      },
    },
  },
}: {
  tierPrice?: unknown
} = {}) => {
  const checkoutCalls: Array<unknown> = []

  const context = {
    db: {
      tierPrice: {
        findFirst: async () => tierPrice,
      },
    },
    stripe: {
      checkout: {
        sessions: {
          create: async (...args: Array<unknown>) => {
            checkoutCalls.push(args)
            return { id: "cs_openads", url: "https://checkout.stripe.test/session" }
          },
        },
      },
    },
    env: {
      APP_URL: "https://app.openads.test",
      STRIPE_PLATFORM_FEE_PERCENT: 5,
    },
  } as unknown as Context

  return { context, checkoutCalls }
}

describe("tier.public.createCheckout", () => {
  it("creates connected-account checkout with metadata and application fee", async () => {
    const { context, checkoutCalls } = createContext()
    const createCheckout = tierRouter.public.createCheckout.callable({ context })

    await expect(
      createCheckout({ tierPriceId: "tier_price_monthly", email: "sponsor@example.com" }),
    ).resolves.toEqual({
      url: "https://checkout.stripe.test/session",
      sessionId: "cs_openads",
    })

    expect(checkoutCalls).toEqual([
      [
        {
          mode: "subscription",
          line_items: [{ price: "price_monthly", quantity: 1 }],
          customer_email: "sponsor@example.com",
          success_url:
            "https://app.openads.test/advertise/success?workspace_id=ws_openads&session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "https://app.openads.test/advertise/cancelled",
          client_reference_id: "ws_openads",
          subscription_data: {
            application_fee_percent: 5,
            metadata: {
              workspaceId: "ws_openads",
              tierId: "tier_gold",
              tierPriceId: "tier_price_monthly",
            },
          },
          metadata: {
            workspaceId: "ws_openads",
            tierId: "tier_gold",
            tierPriceId: "tier_price_monthly",
          },
          allow_promotion_codes: true,
        },
        { stripeAccount: "acct_publisher" },
      ],
    ])
  })

  it("rejects unavailable prices and inactive tiers", async () => {
    const unavailable = createContext({ tierPrice: null })
    const inactive = createContext({
      tierPrice: {
        id: "tier_price_monthly",
        stripePriceId: "price_monthly",
        tier: {
          id: "tier_gold",
          isActive: false,
          workspace: { stripeConnectStatus: "Active", stripeConnectId: "acct_publisher" },
        },
      },
    })

    await expect(
      tierRouter.public.createCheckout
        .callable({ context: unavailable.context })({
          tierPriceId: "missing_price",
          email: "sponsor@example.com",
        })
        .catch(error => {
          expect(error).toBeInstanceOf(ORPCError)
          throw error
        }),
    ).rejects.toHaveProperty("code", "NOT_FOUND")

    await expect(
      tierRouter.public.createCheckout
        .callable({ context: inactive.context })({
          tierPriceId: "tier_price_monthly",
          email: "sponsor@example.com",
        })
        .catch(error => {
          expect(error).toBeInstanceOf(ORPCError)
          throw error
        }),
    ).rejects.toHaveProperty("code", "NOT_FOUND")
  })

  it("rejects checkout when the publisher cannot accept payments", async () => {
    const { context } = createContext({
      tierPrice: {
        id: "tier_price_monthly",
        stripePriceId: "price_monthly",
        tier: {
          id: "tier_gold",
          isActive: true,
          workspace: { stripeConnectStatus: null, stripeConnectId: null },
        },
      },
    })

    await expect(
      tierRouter.public.createCheckout.callable({ context })({
        tierPriceId: "tier_price_monthly",
        email: "sponsor@example.com",
      }),
    ).rejects.toHaveProperty("code", "PRECONDITION_FAILED")
  })
})
