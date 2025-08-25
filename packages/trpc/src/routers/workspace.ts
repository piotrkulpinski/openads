import { WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { authProcedure, router, workspaceProcedure } from "../index"

export const workspaceRouter = router({
  getAll: authProcedure.query(async ({ ctx: { db, user } }) => {
    return await db.workspace.findMany({
      where: db.workspace.belongsTo(user.id),
      orderBy: { createdAt: "asc" },
    })
  }),

  getBySlug: authProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ ctx: { db, user }, input: { slug } }) => {
      return await db.workspace.findFirst({
        where: { AND: [{ slug }, db.workspace.belongsTo(user.id)] },
      })
    }),

  create: authProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db, user }, input: { ...data } }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          members: { create: { userId: user.id, role: WorkspaceMemberRole.Owner } },
        },
      })

      return workspace
    }),

  update: workspaceProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db }, input: { workspaceId, ...data } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data,
      })

      return workspace
    }),

  delete: workspaceProcedure.mutation(async ({ ctx: { db }, input: { workspaceId } }) => {
    console.log("delete", workspaceId)
    const workspace = await db.workspace.delete({
      where: { id: workspaceId },
    })

    return workspace
  }),

  changeDefault: workspaceProcedure.mutation(
    async ({ ctx: { db, user }, input: { workspaceId } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data: { defaultFor: { connect: { id: user.id } } },
      })

      return workspace
    },
  ),
})
