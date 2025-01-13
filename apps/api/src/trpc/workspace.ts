import { WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { z } from "zod"
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
      return await db.workspace.findFirstOrThrow({
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

  changeDefault: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .mutation(async ({ ctx: { db, userId }, input: { workspaceId } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data: { defaultFor: { connect: { id: userId } } },
      })

      return workspace
    }),
})
