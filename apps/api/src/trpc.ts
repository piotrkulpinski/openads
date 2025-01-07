import { TRPCError, initTRPC } from "@trpc/server"
import { auth } from "~/lib/auth"
import type { Context } from "./types"

const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure

export const protectedProcedure = publicProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    const session = await auth.api.getSession({ headers: ctx.req.raw.headers })

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
      ctx: {
        ...ctx,
        user: session.user,
      },
    })
  }),
)
