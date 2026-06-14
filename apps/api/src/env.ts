import { env as auth } from "@openads/auth/env"
import { env as db } from "@openads/db/env"
import { env as emails } from "@openads/emails/env"
import { env as events } from "@openads/events/env"
import { env as redis } from "@openads/redis/env"
import { env as s3 } from "@openads/s3/env"
import { env as stripe } from "@openads/stripe/env"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  extends: [auth, db, redis, stripe, s3, emails, events],

  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().default(3001),
    APP_URL: z.url(),
    API_URL: z.url(),
    // context.dev Logo Link public client id (brandLL_...), used to source favicons.
    LOGO_LINK_CLIENT_ID: z.string().min(1),
  },

  runtimeEnv: process.env,

  // Treat empty strings as unset so defaults apply (PORT= in .env).
  emptyStringAsUndefined: true,
})
