import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3"
import type { Conditions } from "@aws-sdk/s3-presigned-post/dist-types/types"

export type S3ObjectBody = PutObjectCommandInput["Body"]

export interface S3BucketClientConfig {
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  forcePathStyle?: boolean
  publicUrl?: string
  signedUrlTtlSeconds?: number
}

export interface UploadObjectOptions {
  key: string
  body: S3ObjectBody
  cacheControl?: string
  contentType?: string
  metadata?: PutObjectCommandInput["Metadata"]
  acl?: PutObjectCommandInput["ACL"]
}

export interface DeleteObjectOptions {
  key: string
  versionId?: DeleteObjectCommandInput["VersionId"]
}

export interface DeletePrefixOptions {
  prefix: string
}

export interface SignedUrlOptions {
  key: string
  expiresInSeconds?: number
}

export interface SignedUploadUrlOptions extends SignedUrlOptions {
  cacheControl?: string
  contentType?: string
  metadata?: PutObjectCommandInput["Metadata"]
  acl?: PutObjectCommandInput["ACL"]
}

export interface SignedDownloadUrlOptions extends SignedUrlOptions {
  responseContentDisposition?: GetObjectCommandInput["ResponseContentDisposition"]
  responseContentType?: GetObjectCommandInput["ResponseContentType"]
}

export interface PresignedPostOptions {
  key: string
  expiresInSeconds?: number
  conditions?: Array<Conditions>
  fields?: Record<string, string>
  contentLengthRange?: {
    min?: number
    max: number
  }
}

export interface PublicUrlOptions {
  key: string
  baseUrlOverride?: string
}

export interface UploadResult {
  key: string
  url: string
}
