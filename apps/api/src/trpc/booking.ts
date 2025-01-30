import { bookingSchema, idSchema } from "@openads/db/schema"
import { router, spotProcedure, workspaceProcedure } from "~/trpc"

export const bookingRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.booking.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { spot: true },
    })
  }),

  getAllBySpotId: spotProcedure.query(async ({ ctx: { db }, input: { spotId } }) => {
    return await db.booking.findMany({
      where: { spotId },
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
    .input(bookingSchema.partial().merge(idSchema))
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
})
