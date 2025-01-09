import { db } from "@openads/db"
import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { auth as betterAuth } from "~/lib/auth"

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (ctx: FetchCreateContextFnOptions) => {
  const auth = await betterAuth.api.getSession({ headers: ctx.req.headers })

  return { ...ctx, auth, db }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})

export const router = t.router

export const publicProcedure = t.procedure

export const protectedProcedure = publicProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.auth) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
      ctx: {
        ...ctx,
        userId: ctx.auth.user.id,
      },
    })
  }),
)
