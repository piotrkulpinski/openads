import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    AUTOSEND_API_KEY: z.string(),
    AUTOSEND_FROM_EMAIL: z.email(),
    AUTOSEND_FROM_NAME: z.string().default("OpenAds"),
  },

  runtimeEnv: process.env,
})
