import { z } from "zod"
import { authProcedure, router } from "~/trpc"

export const userRouter = router({
  me: authProcedure.query(async ({ ctx: { db, user } }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { defaultWorkspace: true },
    })
  }),

  update: authProcedure
    .input(z.object({ email: z.string().email().optional() }))
    .mutation(async ({ ctx: { db, user }, input }) => {
      return db.user.update({
        where: { id: user.id },
        data: input,
      })
    }),
})
