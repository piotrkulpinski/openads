import { idSchema, tierSchema } from "@openads/db/schema"
import { createSubscriptionCheckoutSession } from "@openads/stripe/checkout"
import {
  archivePrice,
  archiveTierProduct,
  createMonthlyPrice,
  createTierProduct,
  updateTierProduct,
} from "@openads/stripe/products"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  connectEnabledWorkspaceProcedure,
  publicProcedure,
  router,
  workspaceProcedure,
} from "../index"

export const tierRouter = router({
  // Read paths don't require Connect (publishers can browse what they have).
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { workspaceId } }) => {
    return await db.tier.findMany({
      where: { workspaceId },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { id, workspaceId } }) => {
      return await db.tier.findFirst({
        where: { id, workspaceId },
      })
    }),

  create: connectEnabledWorkspaceProcedure
    .input(tierSchema)
    .mutation(
      async ({
        ctx: { db, stripe, workspace },
        input: { name, description, weight, priceMonthly, currency, isActive, order },
      }) => {
        // Create the Tier row first so we can stamp its id onto the Stripe Product metadata —
        // webhooks downstream rely on `tierId` for routing.
        const created = await db.tier.create({
          data: {
            name,
            description: description ?? "",
            weight,
            priceMonthly,
            currency,
            isActive,
            order,
            workspaceId: workspace.id,
          },
        })

        const product = await createTierProduct(stripe, {
          name,
          description,
          metadata: {
            workspaceId: workspace.id,
            tierId: created.id,
            weight: String(weight),
          },
        })

        const price = await createMonthlyPrice(stripe, {
          productId: product.id,
          unitAmount: priceMonthly,
          currency,
          metadata: {
            workspaceId: workspace.id,
            tierId: created.id,
            weight: String(weight),
          },
        })

        return await db.tier.update({
          where: { id: created.id },
          data: { stripeProductId: product.id, stripePriceId: price.id },
        })
      },
    ),

  update: connectEnabledWorkspaceProcedure
    .input(tierSchema.partial().extend(idSchema.shape))
    .mutation(
      async ({
        ctx: { db, stripe, workspace },
        input: { id, name, description, weight, priceMonthly, currency, isActive, order },
      }) => {
        const existing = await db.tier.findFirst({
          where: { id, workspaceId: workspace.id },
        })

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }

        // Sync product-level metadata (name, description, weight, active) when changed.
        if (existing.stripeProductId) {
          const productChanged =
            (name !== undefined && name !== existing.name) ||
            (description !== undefined && description !== existing.description) ||
            (weight !== undefined && weight !== existing.weight) ||
            (isActive !== undefined && isActive !== existing.isActive)

          if (productChanged) {
            await updateTierProduct(stripe, existing.stripeProductId, {
              name,
              description,
              active: isActive,
              metadata: {
                workspaceId: workspace.id,
                tierId: existing.id,
                weight: String(weight ?? existing.weight),
              },
            })
          }
        }

        // Stripe Prices are immutable on unit_amount. Archive the old, create a new one.
        let nextStripePriceId = existing.stripePriceId
        const priceChanged =
          (priceMonthly !== undefined && priceMonthly !== existing.priceMonthly) ||
          (currency !== undefined && currency !== existing.currency)

        if (priceChanged && existing.stripeProductId) {
          if (existing.stripePriceId) {
            await archivePrice(stripe, existing.stripePriceId)
          }
          const newPrice = await createMonthlyPrice(stripe, {
            productId: existing.stripeProductId,
            unitAmount: priceMonthly ?? existing.priceMonthly,
            currency: currency ?? existing.currency,
            metadata: {
              workspaceId: workspace.id,
              tierId: existing.id,
              weight: String(weight ?? existing.weight),
            },
          })
          nextStripePriceId = newPrice.id
        }

        return await db.tier.update({
          where: { id },
          data: {
            name,
            description,
            weight,
            priceMonthly,
            currency,
            isActive,
            order,
            stripePriceId: nextStripePriceId,
          },
        })
      },
    ),

  // Soft delete: archive Stripe product + flip isActive. Existing subscriptions stay billable
  // until they cancel naturally. Hard delete is intentionally not exposed.
  delete: connectEnabledWorkspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db, stripe, workspace }, input: { id } }) => {
      const existing = await db.tier.findFirst({
        where: { id, workspaceId: workspace.id },
      })

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (existing.stripeProductId) {
        await archiveTierProduct(stripe, existing.stripeProductId)
      }

      return await db.tier.update({
        where: { id },
        data: { isActive: false },
      })
    }),

  // Public surface: consumed by the embeddable tier selector (`/embed`).
  public: router({
    listForWorkspace: publicProcedure
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx: { db }, input: { workspaceId } }) => {
        return await db.tier.findMany({
          where: { workspaceId, isActive: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            name: true,
            description: true,
            weight: true,
            priceMonthly: true,
            currency: true,
            order: true,
          },
        })
      }),

    createCheckout: publicProcedure
      .input(
        z.object({
          tierId: z.string(),
          email: z.email(),
        }),
      )
      .mutation(async ({ ctx: { db, stripe, env }, input: { tierId, email } }) => {
        const tier = await db.tier.findFirst({
          where: { id: tierId, isActive: true },
          include: { workspace: true },
        })

        if (!tier || !tier.stripePriceId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tier not available." })
        }

        const { workspace } = tier

        if (!workspace.stripeConnectEnabled || !workspace.stripeConnectId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This publisher cannot accept payments yet.",
          })
        }

        const session = await createSubscriptionCheckoutSession(stripe, {
          priceId: tier.stripePriceId,
          customerEmail: email,
          successUrl: `${env.APP_URL}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${env.APP_URL}/advertise/cancelled`,
          applicationFeePercent: env.STRIPE_PLATFORM_FEE_PERCENT,
          destinationAccountId: workspace.stripeConnectId,
          metadata: {
            workspaceId: workspace.id,
            tierId: tier.id,
          },
        })

        if (!session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe did not return a checkout URL.",
          })
        }

        return { url: session.url, sessionId: session.id }
      }),
  }),
})
