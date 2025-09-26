import { db } from "@openads/db"
import type { Context } from "@openads/trpc"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { env } from "~/env"
import { auth as betterAuth } from "~/services/auth"
import { redis } from "~/services/redis"
import { s3 } from "~/services/s3"
import { stripe } from "~/services/stripe"

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (ctx: FetchCreateContextFnOptions): Promise<Context> => {
  const auth = await betterAuth.api.getSession({ headers: ctx.req.headers })

  return { ...ctx, auth, db, redis, s3, stripe, env }
}
