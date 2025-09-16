import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(0),
  },

  runtimeEnv: process.env,
})
