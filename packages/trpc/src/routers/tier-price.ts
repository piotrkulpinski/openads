import { idSchema, tierPriceSchema } from "@openads/db/schema"
import { archivePrice, createTierPrice } from "@openads/stripe/products"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { connectEnabledWorkspaceProcedure, router } from "../index"

export const tierPriceRouter = router({
  // Add a new price (interval / amount / currency combo) to an existing tier.
  // Stripe Prices are immutable on unit_amount/interval/currency, so price changes
  // are always archive-and-create — there's no `update`.
  create: connectEnabledWorkspaceProcedure
    .input(tierPriceSchema.extend({ tierId: z.string() }))
    .mutation(async ({ ctx: { db, stripe, workspace }, input }) => {
      const tier = await db.tier.findFirst({
        where: { id: input.tierId, workspaceId: workspace.id },
      })

      if (!tier || !tier.stripeProductId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tier not found." })
      }

      // Reject if an active price already exists for this shape — the caller must
      // archive the existing one first. Mirrors Stripe's "archive + create" pattern
      // on the publisher side.
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
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "An active price with this interval and currency already exists. Archive it first.",
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
  archive: connectEnabledWorkspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db, stripe, workspace }, input: { id } }) => {
      const tierPrice = await db.tierPrice.findFirst({
        where: { id, tier: { workspaceId: workspace.id } },
      })

      if (!tierPrice) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (tierPrice.stripePriceId) {
        await archivePrice(stripe, tierPrice.stripePriceId)
      }

      return await db.tierPrice.update({
        where: { id },
        data: { isActive: false },
      })
    }),
})
