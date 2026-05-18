import { idSchema, tierPriceSchema } from "@openads/db/schema"
import { archivePrice, createTierPrice } from "@openads/stripe/products"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, connectEnabledMw, workspaceMw } from "../index"

export const tierPriceRouter = {
  // Stripe Prices are immutable on unit_amount/interval/currency, so price
  // changes are always archive-then-create on both sides. A tier holds at most
  // one active price per (interval, intervalCount, currency) shape.
  create: authProcedure
    .input(tierPriceSchema.extend({ tierId: z.string(), workspaceId: z.string() }))
    .use(workspaceMw)
    .use(connectEnabledMw)
    .handler(async ({ context: { db, stripe, workspace }, input }) => {
      const tier = await db.tier.findFirst({
        where: { id: input.tierId, workspaceId: workspace.id },
      })

      if (!tier || !tier.stripeProductId) {
        throw new ORPCError("NOT_FOUND", { message: "Tier not found." })
      }

      // Amount is intentionally not part of the uniqueness key — that's the
      // field you change by archive-and-create.
      const conflict = await db.tierPrice.findFirst({
        where: {
          tierId: tier.id,
          interval: input.interval,
          intervalCount: input.intervalCount,
          currency: input.currency,
          isActive: true,
        },
      })

      if (conflict) {
        throw new ORPCError("CONFLICT", {
          message:
            "An active price already exists for this interval and currency. Archive it before creating a replacement.",
        })
      }

      const tierPrice = await db.tierPrice.create({
        data: {
          tierId: tier.id,
          interval: input.interval,
          intervalCount: input.intervalCount,
          amount: input.amount,
          currency: input.currency,
        },
      })

      const stripePrice = await createTierPrice(stripe, {
        connectedAccountId: workspace.stripeConnectId,
        productId: tier.stripeProductId,
        unitAmount: input.amount,
        currency: input.currency,
        interval: input.interval,
        intervalCount: input.intervalCount,
        metadata: {
          workspaceId: workspace.id,
          tierId: tier.id,
          tierPriceId: tierPrice.id,
          interval: input.interval,
          intervalCount: String(input.intervalCount),
        },
      })

      return await db.tierPrice.update({
        where: { id: tierPrice.id },
        data: { stripePriceId: stripePrice.id },
      })
    }),

  // Soft delete: archive the Stripe Price and flip isActive. Existing Subscriptions
  // referencing this TierPrice keep billing — Stripe lets archived Prices keep going
  // for in-flight subscribers.
  archive: authProcedure
    .input(idSchema.extend({ workspaceId: z.string() }))
    .use(workspaceMw)
    .use(connectEnabledMw)
    .handler(async ({ context: { db, stripe, workspace }, input: { id } }) => {
      const tierPrice = await db.tierPrice.findFirst({
        where: { id, tier: { workspaceId: workspace.id } },
      })

      if (!tierPrice) {
        throw new ORPCError("NOT_FOUND")
      }

      if (tierPrice.stripePriceId) {
        await archivePrice(stripe, workspace.stripeConnectId, tierPrice.stripePriceId)
      }

      return await db.tierPrice.update({
        where: { id },
        data: { isActive: false },
      })
    }),
}
