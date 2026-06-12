import type { PutObjectCommandInput } from "@aws-sdk/client-s3"

export type S3ObjectBody = PutObjectCommandInput["Body"]

export type S3BucketClientConfig = {
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  forcePathStyle?: boolean
  publicUrl?: string
  signedUrlTtlSeconds?: number
}

export type UploadObjectOptions = {
  key: string
  body: S3ObjectBody
  cacheControl?: string
  contentType?: string
  metadata?: PutObjectCommandInput["Metadata"]
  acl?: PutObjectCommandInput["ACL"]
}

export type DeletePrefixOptions = {
  prefix: string
}

export type SignedUrlOptions = {
  key: string
  expiresInSeconds?: number
}

export type SignedUploadUrlOptions = SignedUrlOptions & {
  cacheControl?: string
  contentType?: string
  metadata?: PutObjectCommandInput["Metadata"]
  acl?: PutObjectCommandInput["ACL"]
  /**
   * When set, the byte length is signed into the URL so the storage backend
   * rejects any upload whose body doesn't match exactly — a server-enforced
   * size cap (R2 doesn't support the presigned-POST `content-length-range`).
   */
  contentLength?: number
}

export type PublicUrlOptions = {
  key: string
}

export type UploadResult = {
  key: string
  url: string
}
