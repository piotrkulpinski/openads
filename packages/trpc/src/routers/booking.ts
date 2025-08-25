import { bookingSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { publicProcedure, router, spotProcedure, workspaceProcedure } from "../index"

export const bookingRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.booking.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { spot: true },
    })
  }),

  getAllBySpotId: spotProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.booking.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { spot: true },
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.booking.findUnique({
        where,
        include: { spot: true },
      })
    }),

  create: workspaceProcedure
    .input(bookingSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      const booking = await db.booking.create({
        data,
      })

      return booking
    }),

  update: workspaceProcedure
    .input(bookingSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.booking.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: workspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.booking.delete({
        where,
      })
    }),

  // Public routes
  public: router({
    getAllBySpotId: publicProcedure
      .input(z.object({ spotId: z.string() }))
      .query(async ({ ctx: { db }, input: { ...where } }) => {
        return await db.booking.findMany({
          where,
          orderBy: { startsAt: "asc" },
          include: { spot: true },
        })
      }),
  }),
})
