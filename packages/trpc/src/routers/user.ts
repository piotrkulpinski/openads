import { userSchema } from "@openads/db/schema"
import { authProcedure, router } from "../index"

export const userRouter = router({
  me: authProcedure.query(async ({ ctx: { db, user } }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { defaultWorkspace: true },
    })
  }),

  update: authProcedure
    .input(userSchema)
    .mutation(async ({ ctx: { db, user }, input: { ...data } }) => {
      return db.user.update({
        where: { id: user.id },
        data,
      })
    }),
})
