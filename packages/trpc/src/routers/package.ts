import { idSchema, packageSchema } from "@openads/db/schema"
import { createSubscriptionCheckoutSession } from "@openads/stripe/checkout"
import {
  archivePackageProduct,
  archivePrice,
  createMonthlyPrice,
  createPackageProduct,
  updatePackageProduct,
} from "@openads/stripe/products"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { connectEnabledZoneProcedure, publicProcedure, router, zoneProcedure } from "../index"

export const packageRouter = router({
  // Read paths don't require Connect (publishers can browse what they have).
  getAll: zoneProcedure.query(async ({ ctx: { db, zone } }) => {
    return await db.package.findMany({
      where: { zoneId: zone.id },
      orderBy: { order: "asc" },
    })
  }),

  getById: zoneProcedure.input(idSchema).query(async ({ ctx: { db, zone }, input: { id } }) => {
    return await db.package.findFirst({
      where: { id, zoneId: zone.id },
    })
  }),

  create: connectEnabledZoneProcedure
    .input(packageSchema)
    .mutation(
      async ({
        ctx: { db, stripe, workspace, zone },
        input: { name, description, weight, priceMonthly, currency, isActive, order },
      }) => {
        const product = await createPackageProduct(stripe, {
          name,
          description,
          metadata: {
            workspaceId: workspace.id,
            zoneId: zone.id,
            weight: String(weight),
          },
        })

        const price = await createMonthlyPrice(stripe, {
          productId: product.id,
          unitAmount: priceMonthly,
          currency,
          metadata: {
            workspaceId: workspace.id,
            zoneId: zone.id,
            weight: String(weight),
          },
        })

        return await db.package.create({
          data: {
            name,
            description: description ?? "",
            weight,
            priceMonthly,
            currency,
            isActive,
            order,
            stripeProductId: product.id,
            stripePriceId: price.id,
            zoneId: zone.id,
          },
        })
      },
    ),

  update: connectEnabledZoneProcedure
    .input(packageSchema.partial().extend(idSchema.shape))
    .mutation(
      async ({
        ctx: { db, stripe, workspace, zone },
        input: { id, name, description, weight, priceMonthly, currency, isActive, order },
      }) => {
        const existing = await db.package.findFirst({
          where: { id, zoneId: zone.id },
        })

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }

        if (existing.stripeProductId) {
          const productChanged =
            (name !== undefined && name !== existing.name) ||
            (description !== undefined && description !== existing.description) ||
            (weight !== undefined && weight !== existing.weight) ||
            (isActive !== undefined && isActive !== existing.isActive)

          if (productChanged) {
            await updatePackageProduct(stripe, existing.stripeProductId, {
              name,
              description,
              active: isActive,
              metadata: {
                workspaceId: workspace.id,
                zoneId: zone.id,
                weight: String(weight ?? existing.weight),
              },
            })
          }
        }

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
              zoneId: zone.id,
              weight: String(weight ?? existing.weight),
            },
          })
          nextStripePriceId = newPrice.id
        }

        return await db.package.update({
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

  delete: connectEnabledZoneProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db, stripe, zone }, input: { id } }) => {
      const existing = await db.package.findFirst({
        where: { id, zoneId: zone.id },
      })

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (existing.stripeProductId) {
        await archivePackageProduct(stripe, existing.stripeProductId)
      }

      return await db.package.update({
        where: { id },
        data: { isActive: false },
      })
    }),

  // Public surface: consumed by the embeddable package selector.
  public: router({
    listForZone: publicProcedure
      .input(z.object({ workspaceId: z.string(), zoneId: z.string() }))
      .query(async ({ ctx: { db }, input: { workspaceId, zoneId } }) => {
        return await db.package.findMany({
          where: {
            zoneId,
            isActive: true,
            zone: { workspaceId },
          },
          orderBy: { order: "asc" },
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
          packageId: z.string(),
          email: z.email(),
        }),
      )
      .mutation(async ({ ctx: { db, stripe, env }, input: { packageId, email } }) => {
        const pkg = await db.package.findFirst({
          where: { id: packageId, isActive: true },
          include: { zone: { include: { workspace: true } } },
        })

        if (!pkg || !pkg.stripePriceId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Package not available." })
        }

        const { workspace } = pkg.zone

        if (!workspace.stripeConnectEnabled || !workspace.stripeConnectId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This publisher cannot accept payments yet.",
          })
        }

        const session = await createSubscriptionCheckoutSession(stripe, {
          priceId: pkg.stripePriceId,
          customerEmail: email,
          successUrl: `${env.APP_URL}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${env.APP_URL}/advertise/cancelled`,
          applicationFeePercent: env.STRIPE_PLATFORM_FEE_PERCENT,
          destinationAccountId: workspace.stripeConnectId,
          metadata: {
            workspaceId: workspace.id,
            packageId: pkg.id,
            zoneId: pkg.zoneId,
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
