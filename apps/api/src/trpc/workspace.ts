import { protectedProcedure, router } from "~/trpc"

export const workspaceRouter = router({
  getAll: protectedProcedure.query(async ({ ctx: { db, userId } }) => {
    return await db.workspace.findMany({
      where: { members: { some: { userId } } },
      // include: { subscription: true },
      orderBy: { createdAt: "asc" },
    })
  }),
})
