import { createS3BucketClient, type S3BucketClient } from "./client"
import { env } from "./env"

export { createS3BucketClient, type S3BucketClient } from "./client"
export { env } from "./env"

/** Creates a bucket client from the package's own validated env vars. */
export const createS3BucketClientFromEnv = (): S3BucketClient =>
  createS3BucketClient({
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    publicUrl: env.S3_PUBLIC_URL,
    signedUrlTtlSeconds: env.S3_SIGNED_URL_TTL,
  })
export type {
  DeleteObjectOptions,
  DeletePrefixOptions,
  PublicUrlOptions,
  S3BucketClientConfig,
  S3ObjectBody,
  SignedUploadUrlOptions,
  UploadObjectOptions,
  UploadResult,
} from "./types"
