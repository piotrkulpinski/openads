import { Redis } from "@upstash/redis"

export interface RedisConfig {
  REDIS_REST_URL: string
  REDIS_REST_TOKEN: string
}

export function createRedisClient(config: RedisConfig) {
  return new Redis({
    url: config.REDIS_REST_URL,
    token: config.REDIS_REST_TOKEN,
  })
}

export type RedisClient = ReturnType<typeof createRedisClient>
