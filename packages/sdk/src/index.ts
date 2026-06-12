const DEFAULT_API_URL = "https://api.openads.co"

// Mirrors the Prisma `FieldType` enum (packages/db/prisma/models/field.prisma).
// Kept as a standalone literal union because the SDK is published with zero
// deps and cannot import `@openads/db`; the server tightens its `/v1` schema to
// the same enum, so any drift surfaces in `/v1/openapi.json`.
export type OpenAdsFieldType = "Text" | "Textarea" | "Url" | "Number" | "Switch" | "Image"

export type OpenAdsFieldValue = {
  id: string
  name: string
  type: OpenAdsFieldType
  value: unknown
}

export type OpenAdsAd = {
  id: string
  name: string
  websiteUrl: string
  faviconUrl: string
  weight: number
  meta: Record<string, unknown>
  fields: Array<OpenAdsFieldValue>
}

/** Extra `fetch` options merged into every request. */
export type OpenAdsRequestOptions = RequestInit & {
  /** Next.js `fetch` extension (App Router caching). Ignored by other runtimes. */
  next?: { revalidate?: number | false; tags?: Array<string> }
}

/**
 * The JSON-serializable subset of `OpenAdsRequestOptions`. The React bindings
 * memoize the client and hook fetches on `JSON.stringify(request)`, so they
 * accept only this shape — `Headers` instances, `AbortSignal`, streams, and
 * other non-serializable `RequestInit` values would silently never invalidate
 * the memo.
 */
export type OpenAdsSerializableRequestOptions = {
  method?: string
  headers?: Record<string, string>
  cache?: RequestCache
  credentials?: RequestCredentials
  mode?: RequestMode
  keepalive?: boolean
  referrerPolicy?: ReferrerPolicy
  next?: { revalidate?: number | false; tags?: Array<string> }
}

export type OpenAdsClientOptions = {
  workspaceSlug: string
  apiUrl?: string
  fetch?: typeof fetch
  request?: OpenAdsRequestOptions
}

export type OpenAdsPlacementOptions = {
  weightGte?: number
  excludeIds?: Array<string>
  request?: OpenAdsRequestOptions
}

export type OpenAdsPlacementListOptions = OpenAdsPlacementOptions & {
  count?: number
}

export type OpenAdsTrackOptions = {
  request?: OpenAdsRequestOptions
}

type CurrentAdsResponse = {
  ads: Array<OpenAdsAd>
}

type TrackResponse = {
  success: boolean
}

export class OpenAdsApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`OpenAds API request failed with status ${status}`)
    this.name = "OpenAdsApiError"
    this.status = status
    this.body = body
  }
}

const trimTrailingSlash = (value: string): string => {
  return value.replace(/\/+$/, "")
}

const getFetch = (customFetch?: typeof fetch): typeof fetch => {
  if (customFetch) return customFetch

  if (!globalThis.fetch) {
    throw new Error("OpenAds SDK requires a fetch implementation.")
  }

  return globalThis.fetch.bind(globalThis)
}

const mergeRequestOptions = (
  base: OpenAdsRequestOptions | undefined,
  next: OpenAdsRequestOptions | undefined,
): OpenAdsRequestOptions => {
  const headers = new Headers(base?.headers)
  new Headers(next?.headers).forEach((value, key) => {
    headers.set(key, value)
  })

  return {
    ...base,
    ...next,
    headers: Object.fromEntries(headers.entries()),
  }
}

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new OpenAdsApiError(response.status, body)
  }

  return (await response.json()) as T
}

export const createOpenAdsClient = ({
  workspaceSlug,
  apiUrl = DEFAULT_API_URL,
  fetch: customFetch,
  request,
}: OpenAdsClientOptions) => {
  const baseUrl = trimTrailingSlash(apiUrl)
  const fetcher = getFetch(customFetch)

  const fetchJson = async <T>(path: string, options?: OpenAdsRequestOptions): Promise<T> => {
    const response = await fetcher(`${baseUrl}${path}`, mergeRequestOptions(request, options))

    return await readJson<T>(response)
  }

  const buildCurrentAdsPath = ({
    weightGte,
    excludeIds,
    count,
  }: OpenAdsPlacementListOptions = {}): string => {
    const params = new URLSearchParams()
    if (weightGte !== undefined) params.set("weightGte", String(weightGte))
    if (excludeIds?.length) params.set("excludeIds", excludeIds.join(","))
    if (count !== undefined) params.set("count", String(count))

    const query = params.toString()
    const path = `/v1/workspaces/${encodeURIComponent(workspaceSlug)}/ads/current`
    return query ? `${path}?${query}` : path
  }

  const getAds = async ({
    request: placementRequest,
    ...options
  }: OpenAdsPlacementListOptions = {}): Promise<Array<OpenAdsAd>> => {
    const response = await fetchJson<CurrentAdsResponse>(
      buildCurrentAdsPath(options),
      placementRequest,
    )

    return response.ads
  }

  const getAd = async (options: OpenAdsPlacementOptions = {}): Promise<OpenAdsAd | null> => {
    const ads = await getAds({ ...options, count: 1 })
    return ads[0] ?? null
  }

  const recordEvent =
    (kind: "impression" | "click") =>
    (adId: string, options: OpenAdsTrackOptions = {}): Promise<TrackResponse> =>
      fetchJson<TrackResponse>(`/v1/ads/${encodeURIComponent(adId)}/${kind}`, {
        method: "POST",
        keepalive: true,
        ...options.request,
      })

  const recordImpression = recordEvent("impression")
  const recordClick = recordEvent("click")

  return {
    getAd,
    getAds,
    recordImpression,
    recordClick,
  }
}

export type OpenAdsClient = ReturnType<typeof createOpenAdsClient>
