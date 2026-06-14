import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    // Optional: when unset the API falls back to an in-memory client, so local
    // dev works without a running Redis (see `createInMemoryRedisClient`).
    REDIS_URL: z.string().optional(),
  },

  runtimeEnv: process.env,

  // Treat empty strings as unset so a blank `REDIS_URL=` triggers the fallback.
  emptyStringAsUndefined: true,
})
