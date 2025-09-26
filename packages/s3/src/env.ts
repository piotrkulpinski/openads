import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform(value => value === "true" || value === "1")

const numberFromString = z.preprocess(value => {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}, z.number().positive().optional())

export const env = createEnv({
  server: {
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET: z.string(),
    S3_PUBLIC_URL: z.url().optional(),
    S3_FORCE_PATH_STYLE: booleanString.optional(),
    S3_SIGNED_URL_TTL: numberFromString,
  },

  runtimeEnv: process.env,
})
