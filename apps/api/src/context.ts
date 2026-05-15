import { db } from "@openads/db"
import type { Context } from "@openads/trpc"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { env } from "~/env"
import { auth as betterAuth } from "~/services/auth"
import { emails } from "~/services/emails"
import { logger } from "~/services/logger"
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

  const clientIp =
    ctx.req.headers.get("cf-connecting-ip") ??
    ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null

  return { ...ctx, auth, clientIp, db, emails, logger, redis, s3, stripe, env }
}
