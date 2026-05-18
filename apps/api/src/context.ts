import { db } from "@openads/db"
import type { Context } from "@openads/orpc"
import { env } from "~/env"
import { auth as betterAuth } from "~/services/auth"
import { emails } from "~/services/emails"
import { logger } from "~/services/logger"
import { redis } from "~/services/redis"
import { s3 } from "~/services/s3"
import { stripe } from "~/services/stripe"

/**
 * Builds the per-request oRPC context shared by both the RPC and OpenAPI
 * handlers. `headers` is the raw `Request.headers` instance; we mine it for
 * the session and the client IP.
 */
export const createContext = async ({ headers }: { headers: Headers }): Promise<Context> => {
  const auth = await betterAuth.api.getSession({ headers })

  const clientIp =
    headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  return { auth, clientIp, db, emails, logger, redis, s3, stripe, env }
}
