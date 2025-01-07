import { z } from "zod"
import { protectedProcedure, router } from "~/trpc"

export const userRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  update: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement user update logic
      return {
        ...ctx.user,
        ...input,
      }
    }),
})
