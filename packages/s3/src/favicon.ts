import type { S3BucketClient } from "./client"

type FetchAndUploadFaviconProps = {
  websiteUrl: string
  /** context.dev Logo Link public client id (brandLL_...). */
  logoLinkClientId: string
  key: string
  cacheControl?: string
}

/**
 * Builds a context.dev Logo Link URL for a website. Returns a high-quality
 * logo when one exists and a generated SVG monogram otherwise, so the
 * response is always a valid image.
 */
const getLogoUrl = (websiteUrl: string, publicClientId: string): string | null => {
  try {
    const domain = new URL(websiteUrl).hostname
    return `https://logos.context.dev/?publicClientId=${publicClientId}&domain=${encodeURIComponent(domain)}`
  } catch {
    return null
  }
}

/**
 * Fetches a favicon for the given website from the logo service and re-hosts
 * it on the S3 bucket, so clients never reference the third-party URL.
 * Returns the public URL of the uploaded asset, or null if the website URL is
 * invalid or the favicon could not be fetched.
 */
export async function fetchAndUploadFavicon(
  s3: S3BucketClient,
  {
    websiteUrl,
    logoLinkClientId,
    key,
    cacheControl = "public, max-age=86400",
  }: FetchAndUploadFaviconProps,
): Promise<string | null> {
  const sourceUrl = getLogoUrl(websiteUrl, logoLinkClientId)
  if (!sourceUrl) return null

  let response: Response
  try {
    response = await fetch(sourceUrl)
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
