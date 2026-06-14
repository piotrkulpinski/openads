import { StripeConnectStatus } from "@openads/db/client"
import { idSchema, tierPriceSchema, tierSchema } from "@openads/db/schema"
import { LogEvents } from "@openads/events/events"
import { createSubscriptionCheckoutSession } from "@openads/stripe/checkout"
import {
  archivePrice,
  archiveTierProduct,
  createTierPrice,
  createTierProduct,
  updateTierProduct,
} from "@openads/stripe/products"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, connectEnabledMw, publicProcedure, workspaceMw } from "../index"

const workspaceIdSchema = z.object({ workspaceId: z.string() })

const createInputSchema = tierSchema.extend({
  workspaceId: z.string(),
  initialPrices: z.array(tierPriceSchema).min(1, "At least one price is required"),
})

const updateInputSchema = tierSchema
  .partial()
  .extend(idSchema.extend({ workspaceId: z.string() }).shape)

const deleteInputSchema = idSchema.extend({ workspaceId: z.string() })

export const tierRouter = {
  // Read paths don't require Connect (publishers can browse what they have).
  getAll: authProcedure
    .input(workspaceIdSchema)
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { workspaceId } }) => {
      return await db.tier.findMany({
        where: { workspaceId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          prices: {
            where: { isActive: true },
            orderBy: [{ interval: "asc" }, { amount: "asc" }],
          },
        },
      })
    }),

  getById: authProcedure
    .input(idSchema.extend({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { id, workspaceId } }) => {
      return await db.tier.findFirst({
        where: { id, workspaceId },
        include: {
          prices: {
            orderBy: [{ isActive: "desc" }, { interval: "asc" }, { amount: "asc" }],
          },
        },
      })
    }),

  create: authProcedure
    .input(createInputSchema)
    .use(workspaceMw)
    .use(connectEnabledMw)
    .handler(
      async ({
        context: { analytics, db, stripe, user, workspace },
        input: { name, description, weight, isActive, order, features, initialPrices },
      }) => {
        // Create the Tier row first so we can stamp its id onto the Stripe Product metadata.
        const tier = await db.tier.create({
          data: {
            name,
            description: description ?? "",
            weight,
            isActive,
            order,
            features,
            workspaceId: workspace.id,
          },
        })

        const product = await createTierProduct(stripe, {
          connectedAccountId: workspace.stripeConnectId,
          name,
          description,
          metadata: {
            workspaceId: workspace.id,
            tierId: tier.id,
            weight: String(weight),
          },
          features,
        })

        // One at a time so each local id can be stamped onto its Stripe Price
        // metadata. Partial failures roll back via the catch below.
        const createdStripePriceIds: Array<string> = []
        try {
          for (const price of initialPrices) {
            const tierPriceRow = await db.tierPrice.create({
              data: {
                tierId: tier.id,
                interval: price.interval,
                intervalCount: price.intervalCount,
                amount: price.amount,
                currency: price.currency,
              },
            })

            const stripePrice = await createTierPrice(stripe, {
              connectedAccountId: workspace.stripeConnectId,
              productId: product.id,
              unitAmount: price.amount,
              currency: price.currency,
              interval: price.interval,
              intervalCount: price.intervalCount,
              metadata: {
                workspaceId: workspace.id,
                tierId: tier.id,
                tierPriceId: tierPriceRow.id,
                interval: price.interval,
                intervalCount: String(price.intervalCount),
              },
            })

            createdStripePriceIds.push(stripePrice.id)

            await db.tierPrice.update({
              where: { id: tierPriceRow.id },
              data: { stripePriceId: stripePrice.id },
            })
          }
        } catch (err) {
          // Best-effort cleanup. We swallow secondary errors so the user sees the
          // original failure, not the rollback noise.
          await Promise.allSettled([
            ...createdStripePriceIds.map(id => archivePrice(stripe, workspace.stripeConnectId, id)),
            archiveTierProduct(stripe, workspace.stripeConnectId, product.id),
          ])
          await db.tierPrice.deleteMany({ where: { tierId: tier.id } })
          await db.tier.delete({ where: { id: tier.id } })
          throw err
        }

        analytics.track({
          event: LogEvents.CreateTier.name,
          channel: LogEvents.CreateTier.channel,
          profileId: user.id,
          workspaceId: workspace.id,
          tierId: tier.id,
        })

        // Stamp the Stripe Product id back onto the Tier and return with prices nested.
        return await db.tier.update({
          where: { id: tier.id },
          data: { stripeProductId: product.id },
          include: {
            prices: {
              orderBy: [{ isActive: "desc" }, { interval: "asc" }, { amount: "asc" }],
            },
          },
        })
      },
    ),

  // Tier-level fields only. Price changes go through tierPrice.create / tierPrice.archive
  // because Stripe Prices are immutable.
  update: authProcedure
    .input(updateInputSchema)
    .use(workspaceMw)
    .use(connectEnabledMw)
    .handler(
      async ({
        context: { db, stripe, workspace },
        input: { id, name, description, weight, isActive, order, features },
      }) => {
        const existing = await db.tier.findFirst({
          where: { id, workspaceId: workspace.id },
        })

        if (!existing) {
          throw new ORPCError("NOT_FOUND")
        }

        // Sync Stripe Product when product-level fields change.
        if (existing.stripeProductId) {
          const featuresChanged =
            features !== undefined &&
            (features.length !== existing.features.length ||
              features.some((f, i) => f !== existing.features[i]))

          const productChanged =
            (name !== undefined && name !== existing.name) ||
            (description !== undefined && description !== existing.description) ||
            (weight !== undefined && weight !== existing.weight) ||
            (isActive !== undefined && isActive !== existing.isActive) ||
            featuresChanged

          if (productChanged) {
            await updateTierProduct(stripe, workspace.stripeConnectId, existing.stripeProductId, {
              name,
              description,
              active: isActive,
              metadata: {
                workspaceId: workspace.id,
                tierId: existing.id,
                weight: String(weight ?? existing.weight),
              },
              features: featuresChanged ? features : undefined,
            })
          }
        }

        return await db.tier.update({
          where: { id },
          data: { name, description, weight, isActive, order, features },
        })
      },
    ),

  // Soft delete: archive Stripe Product + all active prices + flip Tier.isActive.
  // Existing subscriptions stay billable until they cancel naturally.
  delete: authProcedure
    .input(deleteInputSchema)
    .use(workspaceMw)
    .use(connectEnabledMw)
    .handler(async ({ context: { db, stripe, workspace }, input: { id } }) => {
      const existing = await db.tier.findFirst({
        where: { id, workspaceId: workspace.id },
        include: { prices: { where: { isActive: true } } },
      })

      if (!existing) {
        throw new ORPCError("NOT_FOUND")
      }

      if (existing.stripeProductId) {
        await archiveTierProduct(stripe, workspace.stripeConnectId, existing.stripeProductId)
      }

      // Archive every active Stripe Price under this tier (Stripe-side).
      for (const tierPrice of existing.prices) {
        if (tierPrice.stripePriceId) {
          await archivePrice(stripe, workspace.stripeConnectId, tierPrice.stripePriceId)
        }
      }

      // Flip local isActive on Tier + all its prices in one go.
      await db.tierPrice.updateMany({
        where: { tierId: id, isActive: true },
        data: { isActive: false },
      })

      return await db.tier.update({
        where: { id },
        data: { isActive: false },
      })
    }),

  // Public surface: consumed by the embeddable tier selector (`/embed`).
  public: {
    listForWorkspace: publicProcedure
      .input(z.object({ slug: z.string() }))
      .handler(async ({ context: { db }, input: { slug } }) => {
        const workspace = await db.workspace.findUnique({
          where: { slug },
          select: { id: true },
        })

        if (!workspace) {
          throw new ORPCError("NOT_FOUND", { message: "Workspace not found." })
        }

        return await db.tier.findMany({
          where: { workspaceId: workspace.id, isActive: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            name: true,
            description: true,
            weight: true,
            order: true,
            features: true,
            prices: {
              where: { isActive: true, stripePriceId: { not: null } },
              orderBy: [{ interval: "asc" }, { amount: "asc" }],
              select: {
                id: true,
                interval: true,
                intervalCount: true,
                amount: true,
                currency: true,
              },
            },
          },
        })
      }),

    createCheckout: publicProcedure
      .input(
        z.object({
          tierPriceId: z.string(),
          // Optional — Stripe Checkout collects the email itself; pre-fills when present.
          email: z.email().optional(),
        }),
      )
      .handler(async ({ context: { db, stripe, env }, input: { tierPriceId, email } }) => {
        const tierPrice = await db.tierPrice.findFirst({
          where: { id: tierPriceId, isActive: true },
          include: { tier: { include: { workspace: true } } },
        })

        if (!tierPrice || !tierPrice.stripePriceId) {
          throw new ORPCError("NOT_FOUND", { message: "Price not available." })
        }

        const { tier } = tierPrice
        const { workspace } = tier

        if (!tier.isActive) {
          throw new ORPCError("NOT_FOUND", { message: "Tier not available." })
        }

        if (
          workspace.stripeConnectStatus !== StripeConnectStatus.Active ||
          !workspace.stripeConnectId
        ) {
          throw new ORPCError("PRECONDITION_FAILED", {
            message: "This publisher cannot accept payments yet.",
          })
        }

        const session = await createSubscriptionCheckoutSession(stripe, {
          priceId: tierPrice.stripePriceId,
          customerEmail: email,
          successUrl: `${env.APP_URL}/advertise/success?workspace_id=${workspace.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${env.APP_URL}/advertise/cancelled`,
          applicationFeePercent: env.STRIPE_PLATFORM_FEE_PERCENT,
          connectedAccountId: workspace.stripeConnectId,
          metadata: {
            workspaceId: workspace.id,
            tierId: tier.id,
            tierPriceId: tierPrice.id,
          },
        })

        if (!session.url) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Stripe did not return a checkout URL.",
          })
        }

        return { url: session.url, sessionId: session.id }
      }),
  },
}
