import { describe, expect, it } from "bun:test"
import { createOpenAdsClient } from "@openads/sdk"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
// Must match the plugin `apps/api` mounts — the `/zod4` build, not the root
// (Zod v3) export, which no-ops against this project's v4 schemas.
import { experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin } from "@orpc/zod/zod4"
import type { Context } from "../index"
import { publicRouter } from "../router"

/**
 * Contract test: drives the real `@openads/sdk` against the real
 * `OpenAPIHandler` + `publicRouter` (the wiring `apps/api` mounts at `/v1`).
 *
 * The previous SDK test suite stubbed `fetch` entirely, so it stayed green
 * while the oRPC migration broke the `excludeIds` query contract end-to-end
 * (the SDK sends `?excludeIds=a,b`; the new schema only accepted arrays).
 * This test exercises the actual serialization + deserialization boundary so
 * that class of drift can't ship silently again.
 */

const adRow = {
  id: "ad_live",
  name: "Acme",
  websiteUrl: "https://acme.test",
  subscription: { tier: { weight: 3 } },
  meta: [
    {
      value: "Modern hosting",
      field: { id: "field_desc", name: "description", type: "Textarea" },
    },
  ],
}

type FindManyArgs = { where?: { id?: { notIn?: Array<string> }; subscription?: unknown } }

const createContext = () => {
  const findManyCalls: Array<FindManyArgs> = []

  const db = {
    workspace: {
      findUnique: async () => ({ id: "ws_1" }),
    },
    ad: {
      findMany: async (args: FindManyArgs) => {
        findManyCalls.push(args)
        const excluded = new Set(args.where?.id?.notIn ?? [])
        return [adRow].filter(row => !excluded.has(row.id))
      },
      findUnique: async () => ({ id: "ad_live" }),
    },
    adStat: {
      groupBy: async () => [],
      upsert: async () => ({}),
    },
  }

  const context = {
    db,
    redis: { incr: async () => 1, expire: async () => 1 },
    clientIp: null,
  } as unknown as Context

  return { context, findManyCalls }
}

const mountSdk = (context: Context) => {
  const handler = new OpenAPIHandler(publicRouter, {
    plugins: [new ZodSmartCoercionPlugin()],
  })

  const fetcher: typeof fetch = async (url, init) => {
    const request = new Request(String(url), init as RequestInit)
    const { matched, response } = await handler.handle(request, {
      prefix: "/v1",
      context,
    })
    return matched && response ? response : new Response("not found", { status: 404 })
  }

  return createOpenAdsClient({
    workspaceSlug: "openalternative",
    apiUrl: "https://api.openads.test",
    fetch: fetcher,
  })
}

describe("publicRouter ↔ @openads/sdk contract", () => {
  it("parses the SDK's comma-joined excludeIds into an array (regression: C1)", async () => {
    const { context, findManyCalls } = createContext()
    const client = mountSdk(context)

    const ad = await client.getAd({
      weightGte: 2.5,
      excludeIds: ["ad_old", "ad_2"],
    })

    // No 422: the request resolved and returned the served ad.
    expect(ad?.id).toBe("ad_live")
    expect(ad?.faviconUrl).toContain("acme.test")

    // The comma string `?excludeIds=ad_old,ad_2` reached the serving query as
    // a real array, not the scalar `"ad_old,ad_2"`.
    const firstCall = findManyCalls.at(0)
    expect(firstCall?.where?.id?.notIn).toEqual(["ad_old", "ad_2"])
  })

  it("serves multiple ads and threads excludeIds through rotation", async () => {
    const { context, findManyCalls } = createContext()
    const client = mountSdk(context)

    const ads = await client.getAds({ count: 3 })

    // Only one ad in the fake dataset → second pass excludes it → list of 1.
    expect(ads).toHaveLength(1)
    expect(ads[0]?.id).toBe("ad_live")
    expect(findManyCalls.at(1)?.where?.id?.notIn).toContain("ad_live")
  })

  it("records impressions and clicks over the REST tracking endpoints", async () => {
    const { context } = createContext()
    const client = mountSdk(context)

    await expect(client.recordImpression("ad_live")).resolves.toEqual({ success: true })
    await expect(client.recordClick("ad_live")).resolves.toEqual({ success: true })
  })
})
