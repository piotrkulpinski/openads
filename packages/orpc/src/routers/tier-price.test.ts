import { describe, expect, it } from "bun:test"
import { Prisma } from "@openads/db"
import type { Context } from "../index"
import { tierPriceRouter } from "./tier-price"

const workspace = {
  id: "ws_openads",
  stripeConnectStatus: "Active",
  stripeConnectId: "acct_publisher",
}

const tier = { id: "tier_gold", stripeProductId: "prod_gold", workspaceId: "ws_openads" }

const p2002 = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
  code: "P2002",
  clientVersion: "7.8.0",
  meta: { target: "TierPrice_active_shape_key" },
})

const createContext = ({
  existingConflict = null,
  onCreate = async () => ({ id: "tier_price_new" }),
}: {
  existingConflict?: unknown
  onCreate?: () => Promise<unknown>
} = {}) => {
  const context = {
    auth: { user: { id: "user_owner" } },
    user: { id: "user_owner" },
    db: {
      workspace: {
        belongsTo: () => ({}),
        findFirst: async () => workspace,
      },
      tier: { findFirst: async () => tier },
      tierPrice: {
        findFirst: async () => existingConflict,
        create: onCreate,
      },
    },
    // Reached only on the happy path, which these tests don't exercise.
    stripe: {},
  } as unknown as Context

  return { context }
}

const input = {
  workspaceId: "ws_openads",
  tierId: "tier_gold",
  interval: "Month" as const,
  intervalCount: 1,
  amount: 1900,
  currency: "usd",
}

describe("tierPrice.create conflict handling", () => {
  it("rejects with CONFLICT when an active price of the same shape already exists", async () => {
    const { context } = createContext({ existingConflict: { id: "tier_price_existing" } })

    await expect(tierPriceRouter.create.callable({ context })(input)).rejects.toHaveProperty(
      "code",
      "CONFLICT",
    )
  })

  it("maps the partial-unique-index P2002 race to the same CONFLICT error", async () => {
    // No pre-check conflict, but a concurrent submit wins the race and the
    // `TierPrice_active_shape_key` index rejects this insert with P2002.
    const { context } = createContext({
      existingConflict: null,
      onCreate: async () => {
        throw p2002
      },
    })

    await expect(tierPriceRouter.create.callable({ context })(input)).rejects.toHaveProperty(
      "code",
      "CONFLICT",
    )
  })
})
