import { createInMemoryRedisClient, createRedisClient, type RedisClient } from "@openads/redis"
import { env } from "~/env"
import { logger } from "~/services/logger"

// Reuse one client across hot reloads — `bun --hot` re-imports modules but
// keeps `globalThis`, so without this each reload would open a new connection
// (mirrors the Prisma client singleton).
const globalForRedis = globalThis as typeof globalThis & {
  redisGlobal?: RedisClient
}

// Attach the error listener only on a freshly created client — re-attaching on
// every hot reload would stack duplicate listeners on the cached singleton.
const createClient = (): RedisClient => {
  if (!env.REDIS_URL) {
    logger.warn("REDIS_URL is unset — using in-memory Redis (state is per-process, dev only)")
    return createInMemoryRedisClient()
  }

  const client = createRedisClient({ url: env.REDIS_URL })
  client.on("error", err => logger.error("redis connection error", { err }))
  return client
}

export const redis: RedisClient = globalForRedis.redisGlobal ?? createClient()

if (env.NODE_ENV === "development") globalForRedis.redisGlobal = redis
