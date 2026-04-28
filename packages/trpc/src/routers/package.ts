import { idSchema, packageSchema } from "@openads/db/schema"
import {
  archivePackageProduct,
  archivePrice,
  createMonthlyPrice,
  createPackageProduct,
  updatePackageProduct,
} from "@openads/stripe/products"
import { TRPCError } from "@trpc/server"
import { connectEnabledZoneProcedure, router, zoneProcedure } from "../index"

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

        // Sync product-level metadata (name, description, weight) when changed.
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

  // Soft delete: archive Stripe product + flip isActive. Existing subscriptions stay billable
  // until they cancel naturally. Hard delete is intentionally not exposed.
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
})
