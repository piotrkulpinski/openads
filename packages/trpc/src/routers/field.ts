import { fieldSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { router, workspaceProcedure } from "../index"

export const fieldRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { workspaceId } }) => {
    return await db.field.findMany({
      where: { workspaceId },
      orderBy: { order: "asc" },
    })
  }),

  getById: workspaceProcedure
    .input(idSchema)
    .query(async ({ ctx: { db }, input: { id, workspaceId } }) => {
      return await db.field.findFirst({
        where: { id, workspaceId },
      })
    }),

  create: workspaceProcedure
    .input(fieldSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      return await db.field.create({
        data,
      })
    }),

  update: workspaceProcedure
    .input(fieldSchema.partial().extend(idSchema.shape))
    .mutation(async ({ ctx: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.field.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: workspaceProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db }, input: { ...where } }) => {
      return await db.field.delete({
        where,
      })
    }),

  reorder: workspaceProcedure
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
    .mutation(async ({ ctx: { db, workspace }, input: { fields } }) => {
      await Promise.all(
        fields.map(({ id, order }) =>
          db.field.update({
            where: { id, workspaceId: workspace.id },
            data: { order },
          }),
        ),
      )

      return { success: true }
    }),
})
