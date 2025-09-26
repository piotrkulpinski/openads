import {
  type _Object,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type {
  DeleteObjectOptions,
  DeletePrefixOptions,
  PresignedPostOptions,
  PublicUrlOptions,
  S3BucketClientConfig,
  SignedDownloadUrlOptions,
  SignedUploadUrlOptions,
  UploadObjectOptions,
  UploadResult,
} from "~/types"

const DEFAULT_SIGNED_URL_TTL_SECONDS = 900

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "")
}

function encodeKeyForUrl(key: string) {
  return key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/")
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`
}

function resolvePublicUrl(config: S3BucketClientConfig, override?: string) {
  if (override) return ensureTrailingSlash(override)
  if (config.publicUrl) return ensureTrailingSlash(config.publicUrl)

  if (config.endpoint) {
    const endpointUrl = new URL(config.endpoint)
    if (config.forcePathStyle) {
      return ensureTrailingSlash(`${endpointUrl.origin}/${config.bucket}`)
    }
    return ensureTrailingSlash(`${endpointUrl.protocol}//${config.bucket}.${endpointUrl.host}`)
  }

  const regionSegment = config.region === "us-east-1" ? "" : `.${config.region}`
  return ensureTrailingSlash(`https://${config.bucket}.s3${regionSegment}.amazonaws.com`)
}

export function createS3BucketClient(config: S3BucketClientConfig) {
  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  const defaultSignedUrlTtl = config.signedUrlTtlSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS

  async function uploadObject(options: UploadObjectOptions): Promise<UploadResult> {
    const key = trimLeadingSlash(options.key)

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: options.body,
        CacheControl: options.cacheControl,
        ContentType: options.contentType,
        Metadata: options.metadata,
        ACL: options.acl,
      }),
    )

    return {
      key,
      url: getPublicUrl({ key }),
    }
  }

  async function deleteObject(options: DeleteObjectOptions) {
    const key = trimLeadingSlash(options.key)

    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
        VersionId: options.versionId,
      }),
    )
  }

  async function deletePrefix(options: DeletePrefixOptions) {
    const prefix = ensureTrailingSlash(trimLeadingSlash(options.prefix))

    let continuationToken: string | undefined

    do {
      const listResponse = await client.send(
        new ListObjectsV2Command({
          Bucket: config.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      )

      const contents = (listResponse.Contents ?? []) as _Object[]
      const objects = contents.flatMap(entry => (entry.Key ? [{ Key: entry.Key }] : []))

      if (objects.length > 0) {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: config.bucket,
            Delete: {
              Objects: objects,
              Quiet: true,
            },
          }),
        )
      }

      continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : undefined
    } while (continuationToken)
  }

  function getPublicUrl(options: PublicUrlOptions) {
    const key = trimLeadingSlash(options.key)
    const url = resolvePublicUrl(config, options.baseUrlOverride)

    return `${url}${encodeKeyForUrl(key)}`
  }

  async function getSignedUploadUrl(options: SignedUploadUrlOptions) {
    const key = trimLeadingSlash(options.key)
    const expiresIn = options.expiresInSeconds ?? defaultSignedUrlTtl

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      CacheControl: options.cacheControl,
      ContentType: options.contentType,
      Metadata: options.metadata,
      ACL: options.acl,
    })

    return getSignedUrl(client, command, { expiresIn })
  }

  async function getSignedDownloadUrl(options: SignedDownloadUrlOptions) {
    const key = trimLeadingSlash(options.key)
    const expiresIn = options.expiresInSeconds ?? defaultSignedUrlTtl

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ResponseContentDisposition: options.responseContentDisposition,
      ResponseContentType: options.responseContentType,
    })

    return getSignedUrl(client, command, { expiresIn })
  }

  async function createSignedPost(options: PresignedPostOptions) {
    const key = trimLeadingSlash(options.key)
    const expiresIn = options.expiresInSeconds ?? defaultSignedUrlTtl

    const conditions = options.conditions ? [...options.conditions] : []

    if (options.contentLengthRange) {
      const { min = 0, max } = options.contentLengthRange
      if (typeof max !== "number") {
        throw new Error("contentLengthRange.max must be provided for presigned posts.")
      }
      conditions.push(["content-length-range", min, max])
    }

    return createPresignedPost(client, {
      Bucket: config.bucket,
      Key: key,
      Fields: options.fields,
      Expires: expiresIn,
      Conditions: conditions.length > 0 ? conditions : undefined,
    })
  }

  return {
    client,
    uploadObject,
    deleteObject,
    deletePrefix,
    getPublicUrl,
    getSignedUploadUrl,
    getSignedDownloadUrl,
    createSignedPost,
  }
}

export type S3BucketClient = ReturnType<typeof createS3BucketClient>
