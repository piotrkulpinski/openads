import { publicProcedure, router } from "../index"

export const authRouter = router({
  getSession: publicProcedure.query(async ({ ctx: { auth } }) => {
    return auth
  }),
})
