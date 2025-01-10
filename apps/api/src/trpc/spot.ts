import { router, workspaceProcedure } from "~/trpc"

export const spotRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db, workspaceId } }) => {
    return await db.spot.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    })
  }),
})
