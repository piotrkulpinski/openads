"use client"

import {
  createOpenAdsClient,
  type OpenAdsAd,
  type OpenAdsClient,
  type OpenAdsClientOptions,
  type OpenAdsPlacementListOptions,
  type OpenAdsPlacementOptions,
} from "@openads/sdk"
import {
  createContext,
  type HTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type RefCallback,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type OpenAdsProviderProps = PropsWithChildren<OpenAdsClientOptions>

type OpenAdsQueryState<TData> = {
  data: TData
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<TData>
}

type OpenAdsAdOptions = OpenAdsPlacementOptions & {
  enabled?: boolean
}

type OpenAdsAdsOptions = OpenAdsPlacementListOptions & {
  enabled?: boolean
}

type OpenAdsTrackingOptions = {
  disabled?: boolean
  threshold?: number
  viewabilityDurationMs?: number
}

type OpenAdsTrackingResult = {
  impressionRef: RefCallback<HTMLElement>
  trackClick: () => void
  getClickProps: <TElement extends HTMLElement>(
    props?: HTMLAttributes<TElement>,
  ) => HTMLAttributes<TElement>
}

const OpenAdsContext = createContext<OpenAdsClient | null>(null)

export const OpenAdsProvider = ({
  children,
  workspaceSlug,
  apiUrl,
  fetch,
  request,
}: OpenAdsProviderProps) => {
  const client = useMemo(() => {
    return createOpenAdsClient({ workspaceSlug, apiUrl, fetch, request })
  }, [apiUrl, fetch, request, workspaceSlug])

  return <OpenAdsContext.Provider value={client}>{children}</OpenAdsContext.Provider>
}

export const useOpenAdsClient = (): OpenAdsClient => {
  const client = useContext(OpenAdsContext)

  if (!client) {
    throw new Error("useOpenAdsClient must be used within OpenAdsProvider.")
  }

  return client
}

const getError = (value: unknown): Error => {
  if (value instanceof Error) return value
  return new Error("OpenAds request failed.")
}

export const useOpenAdsAd = ({
  enabled = true,
  weightGte,
  excludeIds,
  request,
}: OpenAdsAdOptions = {}): OpenAdsQueryState<OpenAdsAd | null> => {
  const client = useOpenAdsClient()
  const [data, setData] = useState<OpenAdsAd | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const excludeKey = excludeIds?.join(",") ?? ""

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextData = await client.getAd({ weightGte, excludeIds, request })
      setData(nextData)
      return nextData
    } catch (caught) {
      const nextError = getError(caught)
      setError(nextError)
      throw nextError
    } finally {
      setIsLoading(false)
    }
  }, [client, excludeKey, request, weightGte])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    refetch().catch(() => {})
  }, [enabled, refetch])

  return { data, isLoading, error, refetch }
}

export const useOpenAdsAds = ({
  enabled = true,
  weightGte,
  excludeIds,
  count,
  request,
}: OpenAdsAdsOptions = {}): OpenAdsQueryState<Array<OpenAdsAd>> => {
  const client = useOpenAdsClient()
  const [data, setData] = useState<Array<OpenAdsAd>>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const excludeKey = excludeIds?.join(",") ?? ""

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextData = await client.getAds({ weightGte, excludeIds, count, request })
      setData(nextData)
      return nextData
    } catch (caught) {
      const nextError = getError(caught)
      setError(nextError)
      throw nextError
    } finally {
      setIsLoading(false)
    }
  }, [client, count, excludeKey, request, weightGte])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    refetch().catch(() => {})
  }, [enabled, refetch])

  return { data, isLoading, error, refetch }
}

export const useOpenAdsTracking = (
  ad: OpenAdsAd | null | undefined,
  { disabled = false, threshold = 0.5, viewabilityDurationMs = 500 }: OpenAdsTrackingOptions = {},
): OpenAdsTrackingResult => {
  const client = useOpenAdsClient()
  const [element, setElement] = useState<HTMLElement | null>(null)
  const trackedAdId = useRef<string | null>(null)

  const impressionRef = useCallback<RefCallback<HTMLElement>>(node => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (disabled || !ad || !element || typeof IntersectionObserver === "undefined") return
    if (trackedAdId.current === ad.id) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          timer = setTimeout(() => {
            if (trackedAdId.current === ad.id) return
            trackedAdId.current = ad.id
            client.recordImpression(ad.id).catch(() => {})
          }, viewabilityDurationMs)
          return
        }

        if (timer) {
          clearTimeout(timer)
          timer = null
        }
      },
      { threshold },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [ad, client, disabled, element, threshold, viewabilityDurationMs])

  const trackClick = useCallback(() => {
    if (disabled || !ad) return
    client.recordClick(ad.id).catch(() => {})
  }, [ad, client, disabled])

  const getClickProps = useCallback(
    <TElement extends HTMLElement>(
      props: HTMLAttributes<TElement> = {},
    ): HTMLAttributes<TElement> => {
      return {
        ...props,
        onClick: (event: MouseEvent<TElement>) => {
          trackClick()
          props.onClick?.(event)
        },
      }
    },
    [trackClick],
  )

  return { impressionRef, trackClick, getClickProps }
}

export type {
  OpenAdsAd,
  OpenAdsClient,
  OpenAdsFieldType,
  OpenAdsFieldValue,
  OpenAdsPlacementListOptions,
  OpenAdsPlacementOptions,
  OpenAdsRequestOptions,
} from "@openads/sdk"
