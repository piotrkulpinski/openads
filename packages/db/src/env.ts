import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },

  runtimeEnv: process.env,

  // `bun test` runs without a database — queries never execute there, so an
  // unset DATABASE_URL must not fail at import time.
  skipValidation: process.env.NODE_ENV === "test",
})
