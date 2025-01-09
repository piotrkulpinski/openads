import { WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { protectedProcedure, router } from "~/trpc"

export const workspaceRouter = router({
  getAll: protectedProcedure.query(async ({ ctx: { db, userId } }) => {
    return await db.workspace.findMany({
      where: { members: { some: { userId } } },
      // include: { subscription: true },
      orderBy: { createdAt: "asc" },
    })
  }),

  create: protectedProcedure
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
})
