import { type S3BucketClient, createS3BucketClientFromEnv } from "@openads/s3"

export const s3: S3BucketClient = createS3BucketClientFromEnv()
