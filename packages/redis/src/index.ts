import Redis, { type RedisOptions } from "ioredis"

const RETRY_DELAY_MS = 200
const MAX_RETRY_DELAY_MS = 2000

/**
 * The narrow slice of the Redis API this codebase actually uses. Both the real
 * ioredis client and the in-memory fallback satisfy it, so callers can stay
 * agnostic about which one is wired in.
 */
export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string | number): Promise<"OK">
  set(key: string, value: string | number, secondsToken: "EX", seconds: number): Promise<"OK">
  del(...keys: string[]): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
}

export type RedisConfig = {
  url: string
  options?: RedisOptions
}

// Returns the concrete ioredis client (a superset of `RedisClient`) so callers
// keep access to connection-level APIs like `.on("error", …)`.
export function createRedisClient({ url, options }: RedisConfig): Redis {
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: times => Math.min(times * RETRY_DELAY_MS, MAX_RETRY_DELAY_MS),
    ...options,
  })

  // Swallow transient connection errors so they don't crash the process;
  // callers handle failures per operation.
  client.on("error", () => {})

  return client
}

/**
 * Process-local stand-in for Redis, used when `REDIS_URL` is unset (typically
 * local dev without a Redis server). It keeps onboarding state, Stripe OAuth
 * state, and rate-limit counters working within a single process — the dev API
 * runs as one process, so this is functionally equivalent there. State is lost
 * on restart and not shared across processes, so it is not for production.
 */
export function createInMemoryRedisClient(): RedisClient {
  const store = new Map<string, { value: string; expiresAt?: number }>()

  const read = (key: string): string | null => {
    const entry = store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
      store.delete(key)
      return null
    }
    return entry.value
  }

  return {
    async get(key) {
      return read(key)
    },
    async set(key, value, _secondsToken?: "EX", seconds?: number) {
      const expiresAt = seconds !== undefined ? Date.now() + seconds * 1000 : undefined
      store.set(key, { value: String(value), expiresAt })
      return "OK"
    },
    async del(...keys) {
      let removed = 0
      for (const key of keys) {
        if (store.delete(key)) removed++
      }
      return removed
    },
    async incr(key) {
      const next = (read(key) === null ? 0 : Number(read(key))) + 1
      store.set(key, { value: String(next), expiresAt: store.get(key)?.expiresAt })
      return next
    },
    async expire(key, seconds) {
      const entry = store.get(key)
      if (!entry) return 0
      entry.expiresAt = Date.now() + seconds * 1000
      return 1
    },
  }
}
