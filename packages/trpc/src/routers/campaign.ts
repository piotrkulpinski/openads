import { campaignSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { publicProcedure, router, workspaceProcedure, zoneProcedure } from "../index"

export const campaignRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.campaign.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { zone: true },
    })
  }),

  getAllByZoneId: zoneProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.campaign.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { zone: true },
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.campaign.findUniqueOrThrow({
        where,
        include: { zone: true },
      })
    }),

  create: workspaceProcedure
    .input(campaignSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      const campaign = await db.campaign.create({
        data,
      })

      return campaign
    }),

  update: workspaceProcedure
    .input(campaignSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.campaign.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: workspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.campaign.delete({
        where,
      })
    }),

  // Public routes
  public: router({
    getAllByZoneId: publicProcedure
      .input(z.object({ zoneId: z.string() }))
      .query(async ({ ctx: { db }, input: { ...where } }) => {
        return await db.campaign.findMany({
          where,
          orderBy: { startsAt: "asc" },
          include: { zone: true },
        })
      }),
  }),
})
