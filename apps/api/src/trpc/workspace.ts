import { WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { z } from "zod"
import { generateId } from "~/lib/ids"
import { authProcedure, router } from "~/trpc"

export const workspaceRouter = router({
  getAll: authProcedure.query(async ({ ctx: { db, userId } }) => {
    return await db.workspace.findMany({
      where: { members: { some: { userId } } },
      // include: { subscription: true },
      orderBy: { createdAt: "asc" },
    })
  }),

  create: authProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db, userId }, input: { ...data } }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          id: generateId("workspace"),
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
