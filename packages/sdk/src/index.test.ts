import { describe, expect, it } from "bun:test"
import { createOpenAdsClient, OpenAdsApiError } from "./index"

const sampleAd = {
  id: "ad_123",
  name: "Acme",
  websiteUrl: "https://acme.test",
  faviconUrl: "https://www.google.com/s2/favicons?sz=128&domain_url=https%3A%2F%2Facme.test",
  weight: 2.5,
  meta: { description: "Modern hosting" },
  fields: [
    {
      id: "field_description",
      name: "description",
      type: "Textarea" as const,
      value: "Modern hosting",
    },
  ],
}

describe("createOpenAdsClient", () => {
  it("fetches one ad with placement query parameters", async () => {
    const calls: Array<{ url: string; options?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, options) => {
      calls.push({ url: String(url), options })
      return Response.json({ ads: [sampleAd] })
    }

    const client = createOpenAdsClient({
      workspaceSlug: "openalternative",
      apiUrl: "https://api.openads.test/",
      fetch: fetcher,
    })

    const ad = await client.getAd({
      weightGte: 2.5,
      excludeIds: ["ad_old"],
      request: { cache: "no-store" },
    })

    expect(ad).toEqual(sampleAd)
    expect(calls).toEqual([
      {
        url: "https://api.openads.test/v1/workspaces/openalternative/ads/current?weightGte=2.5&excludeIds=ad_old&count=1",
        options: { cache: "no-store", headers: {} },
      },
    ])
  })

  it("fetches multiple ads for sponsor grids", async () => {
    const calls: Array<string> = []
    const fetcher: typeof fetch = async url => {
      calls.push(String(url))
      return Response.json({ ads: [sampleAd] })
    }

    const client = createOpenAdsClient({
      workspaceSlug: "openalternative",
      apiUrl: "https://api.openads.test",
      fetch: fetcher,
    })

    const ads = await client.getAds({ count: 5, weightGte: 2.5 })

    expect(ads).toEqual([sampleAd])
    expect(calls[0]).toBe(
      "https://api.openads.test/v1/workspaces/openalternative/ads/current?weightGte=2.5&count=5",
    )
  })

  it("records impressions and clicks", async () => {
    const calls: Array<{ url: string; method?: string }> = []
    const fetcher: typeof fetch = async (url, options) => {
      calls.push({ url: String(url), method: options?.method })
      return Response.json({ success: true })
    }

    const client = createOpenAdsClient({
      workspaceSlug: "openalternative",
      apiUrl: "https://api.openads.test",
      fetch: fetcher,
    })

    await client.recordImpression("ad_123")
    await client.recordClick("ad_123")

    expect(calls).toEqual([
      { url: "https://api.openads.test/v1/ads/ad_123/impression", method: "POST" },
      { url: "https://api.openads.test/v1/ads/ad_123/click", method: "POST" },
    ])
  })

  it("throws typed API errors for failed requests", async () => {
    const fetcher: typeof fetch = async () => {
      // Real post-oRPC error envelope (was `{ error }` / 400 pre-migration).
      return Response.json(
        { defined: false, code: "NOT_FOUND", status: 404, message: "Workspace not found." },
        { status: 404 },
      )
    }

    const client = createOpenAdsClient({
      workspaceSlug: "missing",
      apiUrl: "https://api.openads.test",
      fetch: fetcher,
    })

    await expect(client.getAd()).rejects.toBeInstanceOf(OpenAdsApiError)
  })
})
