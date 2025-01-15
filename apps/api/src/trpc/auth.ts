import { auth as betterAuth } from "~/lib/auth"
import { procedure, router } from "~/trpc"

export const authRouter = router({
  getSession: procedure.query(async ({ ctx: { req } }) => {
    return await betterAuth.api.getSession({ headers: req.headers })
  }),
})
