import { describe, expect, it } from "bun:test"
import type { Context } from "../index"
import { adRouter } from "./ad"

const createContext = ({
  cancelSubscription = async () => ({ id: "sub_stripe" }),
}: {
  cancelSubscription?: (...args: Array<unknown>) => Promise<unknown>
} = {}) => {
  const updateCalls: Array<unknown> = []
  const emailCalls: Array<unknown> = []
  const cancelCalls: Array<unknown> = []
  const warnCalls: Array<unknown> = []

  const workspace = {
    id: "ws_openads",
    name: "OpenAds Weekly",
    stripeConnectId: "acct_publisher",
  }

  const ad = {
    id: "ad_pending",
    status: "Pending",
    name: "Acme Gold",
    websiteUrl: "https://acme.test",
    subscription: {
      stripeSubscriptionId: "sub_stripe",
      advertiser: {
        name: "Acme",
        email: "sponsor@example.com",
      },
      tier: { id: "tier_gold", name: "Gold" },
      tierPrice: { id: "tier_price_monthly" },
    },
    meta: [],
  }

  const context = {
    auth: { user: { id: "user_owner" } },
    user: { id: "user_owner" },
    db: {
      workspace: {
        belongsTo: () => ({}),
        findFirst: async () => workspace,
      },
      ad: {
        findFirst: async () => ad,
        update: async (args: unknown) => {
          updateCalls.push(args)
          return { ...ad, ...(args as { data: object }).data }
        },
      },
    },
    emails: {
      send: async (args: unknown) => {
        emailCalls.push(args)
        return { id: "email_1" }
      },
    },
    stripe: {
      subscriptions: {
        cancel: async (...args: Array<unknown>) => {
          cancelCalls.push(args)
          return await cancelSubscription(...args)
        },
      },
    },
    logger: {
      warn: (...args: Array<unknown>) => {
        warnCalls.push(args)
      },
    },
  } as unknown as Context

  return { context, updateCalls, emailCalls, cancelCalls, warnCalls }
}

describe("ad review actions", () => {
  it("approves an ad and emails the advertiser", async () => {
    const { context, updateCalls, emailCalls } = createContext()

    const result = await adRouter.approve.callable({ context })({
      workspaceId: "ws_openads",
      adId: "ad_pending",
    })

    expect(result.status).toBe("Approved")
    expect(updateCalls[0]).toEqual({
      where: { id: "ad_pending" },
      data: {
        status: "Approved",
        reviewedAt: expect.any(Date),
        rejectionNote: null,
      },
    })
    expect(emailCalls[0]).toMatchObject({
      to: { email: "sponsor@example.com", name: "Acme" },
      subject: "Your ad on OpenAds Weekly is now live",
    })
  })

  it("rejects an ad, cancels the connected-account subscription, and emails the advertiser", async () => {
    const { context, updateCalls, emailCalls, cancelCalls } = createContext()

    const result = await adRouter.reject.callable({ context })({
      workspaceId: "ws_openads",
      adId: "ad_pending",
      note: "The landing page is not reachable.",
    })

    expect(result.status).toBe("Rejected")
    expect(updateCalls[0]).toEqual({
      where: { id: "ad_pending" },
      data: {
        status: "Rejected",
        reviewedAt: expect.any(Date),
        rejectionNote: "The landing page is not reachable.",
      },
    })
    expect(cancelCalls[0]).toEqual(["sub_stripe", {}, { stripeAccount: "acct_publisher" }])
    expect(emailCalls[0]).toMatchObject({
      to: { email: "sponsor@example.com", name: "Acme" },
      subject: "Your ad on OpenAds Weekly was not approved",
    })
  })

  it("keeps rejection successful when Stripe cancellation fails and logs the failure", async () => {
    const { context, warnCalls } = createContext({
      cancelSubscription: async () => {
        throw new Error("Stripe unavailable")
      },
    })

    await expect(
      adRouter.reject.callable({ context })({
        workspaceId: "ws_openads",
        adId: "ad_pending",
        note: "The creative violates our policy.",
      }),
    ).resolves.toHaveProperty("status", "Rejected")

    expect(warnCalls[0]).toMatchObject([
      "ad.reject: failed to cancel stripe subscription",
      {
        stripeSubscriptionId: "sub_stripe",
        adId: "ad_pending",
      },
    ])
  })
})
