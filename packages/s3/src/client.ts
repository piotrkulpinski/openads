import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type {
  DeletePrefixOptions,
  PublicUrlOptions,
  S3BucketClientConfig,
  SignedUploadUrlOptions,
  UploadObjectOptions,
  UploadResult,
} from "./types"

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

function resolvePublicUrl(config: S3BucketClientConfig) {
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
  const basePublicUrl = resolvePublicUrl(config)

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

      const objects = (listResponse.Contents ?? []).flatMap(entry =>
        entry.Key ? [{ Key: entry.Key }] : [],
      )

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
    return `${basePublicUrl}${encodeKeyForUrl(trimLeadingSlash(options.key))}`
  }

  async function getSignedUploadUrl(options: SignedUploadUrlOptions) {
    const key = trimLeadingSlash(options.key)
    const expiresIn = options.expiresInSeconds ?? defaultSignedUrlTtl

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      CacheControl: options.cacheControl,
      ContentType: options.contentType,
      ContentLength: options.contentLength,
      Metadata: options.metadata,
      ACL: options.acl,
    })

    // Sign content-length so the backend rejects a body that doesn't match the
    // declared size; without it in the signed set a client could PUT a larger file.
    const signableHeaders =
      options.contentLength != null
        ? new Set(["host", "content-type", "content-length"])
        : undefined

    return getSignedUrl(client, command, { expiresIn, signableHeaders })
  }

  return {
    client,
    uploadObject,
    deletePrefix,
    getPublicUrl,
    getSignedUploadUrl,
  }
}

export type S3BucketClient = ReturnType<typeof createS3BucketClient>
