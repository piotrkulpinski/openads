import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().default(3001),
    APP_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32).max(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    REDIS_REST_URL: z.string(),
    REDIS_REST_TOKEN: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_CONNECT_CLIENT_ID: z.string(),
    STRIPE_PLATFORM_FEE_PERCENT: z.coerce.number().positive().max(100).default(0),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
