import { describe, expect, it } from "bun:test"
import type { StripeClient } from "./index"
import { archivePrice, archiveTierProduct, createTierPrice, createTierProduct } from "./products"

describe("Stripe product helpers", () => {
  it("scopes product and price writes to the connected account", async () => {
    const calls: Array<unknown> = []
    const stripe = {
      products: {
        create: (...args: Array<unknown>) => {
          calls.push(["products.create", ...args])
          return Promise.resolve({ id: "prod_ads" })
        },
        update: (...args: Array<unknown>) => {
          calls.push(["products.update", ...args])
          return Promise.resolve({ id: "prod_ads" })
        },
      },
      prices: {
        create: (...args: Array<unknown>) => {
          calls.push(["prices.create", ...args])
          return Promise.resolve({ id: "price_ads" })
        },
        update: (...args: Array<unknown>) => {
          calls.push(["prices.update", ...args])
          return Promise.resolve({ id: "price_ads" })
        },
      },
    } as unknown as StripeClient

    await createTierProduct(stripe, {
      connectedAccountId: "acct_publisher",
      name: "Gold",
      description: "Premium placement",
      metadata: { workspaceId: "ws_123", tierId: "tier_gold", weight: "2" },
      features: ["Top slot"],
    })

    await createTierPrice(stripe, {
      connectedAccountId: "acct_publisher",
      productId: "prod_ads",
      unitAmount: 9900,
      currency: "usd",
      interval: "Month",
      intervalCount: 1,
      metadata: {
        workspaceId: "ws_123",
        tierId: "tier_gold",
        tierPriceId: "tier_price_monthly",
        interval: "Month",
        intervalCount: "1",
      },
    })

    await archiveTierProduct(stripe, "acct_publisher", "prod_ads")
    await archivePrice(stripe, "acct_publisher", "price_ads")

    expect(calls).toEqual([
      [
        "products.create",
        {
          name: "Gold",
          description: "Premium placement",
          metadata: { workspaceId: "ws_123", tierId: "tier_gold", weight: "2" },
          marketing_features: [{ name: "Top slot" }],
        },
        { stripeAccount: "acct_publisher" },
      ],
      [
        "prices.create",
        {
          product: "prod_ads",
          unit_amount: 9900,
          currency: "usd",
          recurring: { interval: "month", interval_count: 1 },
          metadata: {
            workspaceId: "ws_123",
            tierId: "tier_gold",
            tierPriceId: "tier_price_monthly",
            interval: "Month",
            intervalCount: "1",
          },
        },
        { stripeAccount: "acct_publisher" },
      ],
      ["products.update", "prod_ads", { active: false }, { stripeAccount: "acct_publisher" }],
      ["prices.update", "price_ads", { active: false }, { stripeAccount: "acct_publisher" }],
    ])
  })
})
