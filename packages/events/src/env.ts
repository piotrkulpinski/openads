import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    // Server-side OpenPanel credentials. Optional: when unset (local dev) the
    // analytics client logs events at debug instead of sending them, so dev
    // works without credentials or network. Required in production to track.
    OPENPANEL_CLIENT_ID: z.string().optional(),
    OPENPANEL_SECRET_KEY: z.string().optional(),
  },

  runtimeEnv: process.env,

  // Treat empty strings as unset so blank values fall back to the dev no-op.
  emptyStringAsUndefined: true,
})
