import { z } from "zod"
import { authProcedure, router } from "~/trpc"

export const userRouter = router({
  me: authProcedure.query(async ({ ctx: { db, userId } }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: userId },
      include: { defaultWorkspace: true },
    })
  }),

  update: authProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: input,
      })
    }),
})
