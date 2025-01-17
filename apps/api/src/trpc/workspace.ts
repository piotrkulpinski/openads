import { WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { authProcedure, router } from "~/trpc"

export const workspaceRouter = router({
  getAll: authProcedure.query(async ({ ctx: { db, userId } }) => {
    return await db.workspace.findMany({
      where: db.workspace.belongsTo(userId),
      orderBy: { createdAt: "asc" },
    })
  }),

  getBySlug: authProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ ctx: { db, userId }, input: { slug } }) => {
      return await db.workspace.findFirst({
        where: { AND: [{ slug }, db.workspace.belongsTo(userId)] },
      })
    }),

  create: authProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db, userId }, input: { ...data } }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          members: { create: { userId, role: WorkspaceMemberRole.Owner } },
        },
      })

      return workspace
    }),

  update: authProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db, userId }, input: { id, ...data } }) => {
      const workspace = await db.workspace.update({
        where: { id, AND: [db.workspace.belongsTo(userId)] },
        data,
      })

      return workspace
    }),

  delete: authProcedure
    .input(workspaceSchema.pick({ id: true }))
    .mutation(async ({ ctx: { db, userId }, input: { id } }) => {
      const workspace = await db.workspace.delete({
        where: { id, AND: [db.workspace.belongsTo(userId)] },
      })

      return workspace
    }),

  changeDefault: authProcedure
    .input(workspaceSchema.pick({ id: true }))
    .mutation(async ({ ctx: { db, userId }, input: { id } }) => {
      const workspace = await db.workspace.update({
        where: { id, AND: [db.workspace.belongsTo(userId)] },
        data: { defaultFor: { connect: { id: userId } } },
      })

      return workspace
    }),
})
