import { createS3BucketClient } from "@openads/s3"
import { env } from "~/env"

export const s3 = createS3BucketClient({
  region: env.S3_REGION,
  bucket: env.S3_BUCKET,
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  publicUrl: env.S3_PUBLIC_URL,
  signedUrlTtlSeconds: env.S3_SIGNED_URL_TTL,
})
