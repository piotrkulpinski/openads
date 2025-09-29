import { idSchema, zoneSchema } from "@openads/db/schema"
import { z } from "zod"
import { publicProcedure, router, workspaceProcedure } from "../index"

export const zoneRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.zone.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.zone.findUnique({
        where,
      })
    }),

  create: workspaceProcedure
    .input(zoneSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      const zone = await db.zone.create({
        data,
      })

      return zone
    }),

  update: workspaceProcedure
    .input(zoneSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.zone.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: workspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.zone.delete({
        where,
      })
    }),

  // Public routes
  public: router({
    getAll: publicProcedure
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx: { db }, input: { ...where } }) => {
        return await db.zone.findMany({
          where,
          orderBy: { createdAt: "desc" },
        })
      }),
  }),
})
