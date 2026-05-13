import type { S3BucketClient } from "./client"

interface FetchAndUploadFaviconProps {
  websiteUrl: string
  key: string
  cacheControl?: string
}

/**
 * Fetches a favicon for the given URL via Google's s2/favicons service
 * (handles cases where the site uses `<link rel="icon">` rather than /favicon.ico)
 * and uploads it to the S3 bucket. Returns the public URL of the uploaded asset,
 * or null if the favicon could not be fetched.
 */
export async function fetchAndUploadFavicon(
  s3: S3BucketClient,
  { websiteUrl, key, cacheControl = "public, max-age=86400" }: FetchAndUploadFaviconProps,
): Promise<string | null> {
  let domain: string
  try {
    domain = new URL(websiteUrl).hostname
  } catch {
    return null
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`

  let response: Response
  try {
    response = await fetch(faviconUrl)
  } catch {
    return null
  }

  if (!response.ok) return null

  const arrayBuffer = await response.arrayBuffer()
  const body = Buffer.from(arrayBuffer)
  const contentType = response.headers.get("content-type") ?? "image/png"

  const result = await s3.uploadObject({
    key,
    body,
    contentType,
    cacheControl,
  })

  return result.url
}
