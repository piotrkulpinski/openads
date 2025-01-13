import { spotSchema } from "@openads/db/schema"
import { router, workspaceProcedure } from "~/trpc"

export const spotRouter = router({
  getAll: workspaceProcedure.query(async ({ ctx: { db }, input: { workspaceId } }) => {
    return await db.spot.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    })
  }),

  create: workspaceProcedure
    .input(spotSchema)
    .mutation(async ({ ctx: { db }, input: { ...data } }) => {
      const spot = await db.spot.create({
        data: { ...data },
      })

      return spot
    }),
})
