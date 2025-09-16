import { createRedisClient } from "@openads/redis"
import { env } from "~/env"

export const redis = createRedisClient({
  REDIS_REST_URL: env.REDIS_REST_URL,
  REDIS_REST_TOKEN: env.REDIS_REST_TOKEN,
})
