import { fieldSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { router, zoneProcedure } from "../index"

export const fieldRouter = router({
  getAll: zoneProcedure.query(async ({ ctx: { db }, input: { zoneId } }) => {
    return await db.field.findMany({
      where: { zoneId },
      orderBy: { order: "asc" },
    })
  }),

  create: zoneProcedure.input(fieldSchema).mutation(async ({ ctx: { db }, input: { ...data } }) => {
    return await db.field.create({
      data,
    })
  }),

  update: zoneProcedure
    .input(fieldSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, zoneId, ...data } }) => {
      return await db.field.update({
        where: { id, zoneId },
        data,
      })
    }),

  delete: zoneProcedure.input(idSchema).mutation(async ({ ctx: { db }, input: { ...where } }) => {
    return await db.field.delete({
      where,
    })
  }),

  reorder: zoneProcedure
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
    .mutation(async ({ ctx: { db, zone }, input: { fields } }) => {
      await Promise.all(
        fields.map(({ id, order }) =>
          db.field.update({
            where: { id, zoneId: zone.id },
            data: { order },
          }),
        ),
      )

      return { success: true }
    }),
})
