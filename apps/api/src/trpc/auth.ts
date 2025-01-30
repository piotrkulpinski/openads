import { auth as betterAuth } from "~/lib/auth"
import { publicProcedure, router } from "~/trpc"

export const authRouter = router({
  getSession: publicProcedure.query(async ({ ctx: { req } }) => {
    return await betterAuth.api.getSession({ headers: req.headers })
  }),
})
