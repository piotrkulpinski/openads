import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const booleanString = z.stringbool({
  truthy: ["true", "1"],
  falsy: ["false", "0"],
  case: "sensitive",
})

export const env = createEnv({
  server: {
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET: z.string(),
    S3_PUBLIC_URL: z.url().optional(),
    S3_FORCE_PATH_STYLE: booleanString.optional(),
    S3_SIGNED_URL_TTL: z.coerce.number().positive().optional(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
