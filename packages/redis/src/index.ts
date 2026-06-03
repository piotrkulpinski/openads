import Redis, { type RedisOptions } from "ioredis"

const RETRY_DELAY_MS = 200
const MAX_RETRY_DELAY_MS = 2000

export interface RedisConfig {
  REDIS_URL: string
  options?: RedisOptions
}

export function createRedisClient({ REDIS_URL, options }: RedisConfig) {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: times => Math.min(times * RETRY_DELAY_MS, MAX_RETRY_DELAY_MS),
    ...options,
  })

  // Swallow transient connection errors so they don't crash the process;
  // callers handle failures per operation.
  client.on("error", () => {})

  return client
}

export type RedisClient = Redis
