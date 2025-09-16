import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    REDIS_REST_URL: z.string(),
    REDIS_REST_TOKEN: z.string(),
  },

  runtimeEnv: process.env,
})
