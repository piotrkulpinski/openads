const DEFAULT_API_URL = "https://api.openads.co"

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

export type OpenAdsRequestOptions = RequestInit & {
  next?: unknown
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
  ad: OpenAdsAd | null
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
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new OpenAdsApiError(response.status, body)
  }

  return body as T
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

  const getAd = async ({
    request: placementRequest,
    ...options
  }: OpenAdsPlacementOptions = {}): Promise<OpenAdsAd | null> => {
    const response = await fetchJson<CurrentAdsResponse>(
      buildCurrentAdsPath({ ...options, count: 1 }),
      placementRequest,
    )

    return response.ad
  }

  const recordImpression = async (
    adId: string,
    options: OpenAdsTrackOptions = {},
  ): Promise<TrackResponse> => {
    return await fetchJson<TrackResponse>(`/v1/ads/${encodeURIComponent(adId)}/impression`, {
      method: "POST",
      keepalive: true,
      ...options.request,
    })
  }

  const recordClick = async (
    adId: string,
    options: OpenAdsTrackOptions = {},
  ): Promise<TrackResponse> => {
    return await fetchJson<TrackResponse>(`/v1/ads/${encodeURIComponent(adId)}/click`, {
      method: "POST",
      keepalive: true,
      ...options.request,
    })
  }

  return {
    getAd,
    getAds,
    recordImpression,
    recordClick,
  }
}

export type OpenAdsClient = ReturnType<typeof createOpenAdsClient>
