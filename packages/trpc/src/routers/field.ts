import { fieldSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { router, spotProcedure } from "../index"

export const fieldRouter = router({
  getAll: spotProcedure.query(async ({ ctx: { db }, input: { spotId } }) => {
    return await db.field.findMany({
      where: { spotId },
      orderBy: { order: "asc" },
    })
  }),

  create: spotProcedure.input(fieldSchema).mutation(async ({ ctx: { db }, input: { ...data } }) => {
    return await db.field.create({
      data,
    })
  }),

  update: spotProcedure
    .input(fieldSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, spotId, ...data } }) => {
      return await db.field.update({
        where: { id, spotId },
        data,
      })
    }),

  delete: spotProcedure.input(idSchema).mutation(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.field.delete({
      where,
    })
  }),

  reorder: spotProcedure
    .input(
      z.object({
        fields: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx: { db, spot }, input: { fields } }) => {
      await Promise.all(
        fields.map(({ id, order }) =>
          db.field.update({
            where: { id, spotId: spot.id },
            data: { order },
          }),
        ),
      )

      return { success: true }
    }),
})
