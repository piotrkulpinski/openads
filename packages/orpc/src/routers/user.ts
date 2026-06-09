import { userSchema } from "@openads/db/schema"
import { authProcedure } from "../index"

export const userRouter = {
  me: authProcedure.handler(async ({ context: { db, user } }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { defaultWorkspace: true },
    })
  }),

  update: authProcedure
    .input(userSchema)
    .handler(async ({ context: { db, user }, input: data }) => {
      return db.user.update({
        where: { id: user.id },
        data,
      })
    }),
}
