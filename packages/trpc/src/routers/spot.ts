import { idSchema, spotSchema } from "@openads/db/schema"
import { z } from "zod"
import { publicProcedure, router, workspaceProcedure } from "../index"

export const spotRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.spot.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.spot.findUnique({
        where,
      })
    }),

  create: workspaceProcedure
    .input(spotSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      const spot = await db.spot.create({
        data,
      })

      return spot
    }),

  update: workspaceProcedure
    .input(spotSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.spot.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: workspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.spot.delete({
        where,
      })
    }),

  // Public routes
  public: router({
    getAll: publicProcedure
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx: { db }, input: { ...where } }) => {
        return await db.spot.findMany({
          where,
          orderBy: { createdAt: "desc" },
        })
      }),
  }),
})
