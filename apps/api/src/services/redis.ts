import { createRedisClient, type RedisClient } from "@openads/redis"
import { env } from "~/env"

// Reuse one client across hot reloads — `bun --hot` re-imports modules but
// keeps `globalThis`, so without this each reload would open a new connection
// (mirrors the Prisma client singleton).
const globalForRedis = globalThis as typeof globalThis & {
  redisGlobal?: RedisClient
}

export const redis: RedisClient =
  globalForRedis.redisGlobal ?? createRedisClient({ REDIS_URL: env.REDIS_URL })

if (env.NODE_ENV === "development") globalForRedis.redisGlobal = redis
