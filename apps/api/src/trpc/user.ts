import { z } from "zod"
import { protectedProcedure, router } from "~/trpc"

export const userRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.userId
  }),

  update: protectedProcedure
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
