import { fieldSchema, idSchema } from "@openads/db/schema"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"

const workspaceIdSchema = z.object({ workspaceId: z.string() })

export const fieldRouter = {
  getAll: authProcedure
    .input(workspaceIdSchema)
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { workspaceId } }) => {
      return await db.field.findMany({
        where: { workspaceId },
        orderBy: { order: "asc" },
      })
    }),

  getById: authProcedure
    .input(idSchema.extend({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { id, workspaceId } }) => {
      return await db.field.findFirst({
        where: { id, workspaceId },
      })
    }),

  create: authProcedure
    .input(fieldSchema.extend({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: data }) => {
      return await db.field.create({
        data,
      })
    }),

  update: authProcedure
    .input(fieldSchema.partial().extend(idSchema.extend({ workspaceId: z.string() }).shape))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { id, workspaceId, ...data } }) => {
      return await db.field.update({
        where: { id, workspaceId },
        data,
      })
    }),

  delete: authProcedure
    .input(idSchema.extend({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { id, workspaceId } }) => {
      return await db.field.delete({
        where: { id, workspaceId },
      })
    }),

  reorder: authProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        fields: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
          }),
        ),
      }),
    )
    .use(workspaceMw)
    .handler(async ({ context: { db, workspace }, input: { fields } }) => {
      await db.$transaction(
        fields.map(({ id, order }) =>
          db.field.update({
            where: { id, workspaceId: workspace.id },
            data: { order },
          }),
        ),
      )

      return { success: true }
    }),
}
