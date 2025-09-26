import { env as auth } from "@openads/auth/env"
import { env as db } from "@openads/db/env"
import { env as redis } from "@openads/redis/env"
import { env as stripe } from "@openads/stripe/env"
import { env as s3 } from "@openads/s3/env"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  extends: [auth, db, redis, stripe, s3],

  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().default(3001),
    APP_URL: z.url(),
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
