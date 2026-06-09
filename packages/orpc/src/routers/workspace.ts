import { WorkspaceMemberRole } from "@openads/db/client"
import { idSchema, workspaceSchema } from "@openads/db/schema"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"

const workspaceUpdateInput = workspaceSchema.extend({ workspaceId: z.string() })

export const workspaceRouter = {
  getAll: authProcedure.handler(async ({ context: { db, user } }) => {
    return await db.workspace.findMany({
      where: db.workspace.belongsTo(user.id),
      orderBy: { createdAt: "asc" },
    })
  }),

  getById: authProcedure
    .input(idSchema)
    .handler(async ({ context: { db, user }, input: { id } }) => {
      return await db.workspace.findFirst({
        where: { AND: [{ id }, db.workspace.belongsTo(user.id)] },
      })
    }),

  create: authProcedure
    .input(workspaceSchema)
    .handler(async ({ context: { db, user }, input: data }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          members: { create: { userId: user.id, role: WorkspaceMemberRole.Owner } },
        },
      })

      return workspace
    }),

  update: authProcedure
    .input(workspaceUpdateInput)
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { workspaceId, ...data } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data,
      })

      return workspace
    }),

  delete: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db }, input: { workspaceId } }) => {
      const workspace = await db.workspace.delete({
        where: { id: workspaceId },
      })

      return workspace
    }),

  changeDefault: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db, user }, input: { workspaceId } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data: { defaultFor: { connect: { id: user.id } } },
      })

      return workspace
    }),
}
