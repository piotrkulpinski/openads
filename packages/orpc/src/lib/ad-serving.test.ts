import { describe, expect, it } from "bun:test"
import { findServingAd, findServingAds } from "./ad-serving"

const adRow = {
  id: "ad_gold",
  name: "Acme Gold",
  websiteUrl: "https://acme.test",
  subscription: { tier: { weight: 3 } },
  meta: [
    {
      value: "Modern hosting",
      field: { id: "field_description", name: "description", type: "Textarea" },
    },
  ],
}

type FindManyArgs = {
  where?: {
    status?: string
    id?: { notIn?: Array<string> }
    subscription?: {
      workspaceId?: string
      status?: { in?: Array<string> }
      tier?: { weight?: { gte?: number } }
    }
  }
}

const createDb = (rows: Array<typeof adRow>) => {
  const findManyCalls: Array<FindManyArgs> = []

  const db = {
    ad: {
      findMany: async (args: FindManyArgs) => {
        findManyCalls.push(args)
        const excluded = new Set(args.where?.id?.notIn ?? [])
        return rows.filter(row => !excluded.has(row.id))
      },
    },
    adStat: {
      groupBy: async () => [],
    },
  }

  return { db, findManyCalls }
}

describe("findServingAd", () => {
  it("queries only approved ads with active subscriptions and placement filters", async () => {
    const { db, findManyCalls } = createDb([adRow])

    const ad = await findServingAd({
      db: db as never,
      workspaceId: "ws_openads",
      weightGte: 2.5,
      excludeIds: ["ad_old"],
    })

    expect(ad).toEqual({
      id: "ad_gold",
      name: "Acme Gold",
      websiteUrl: "https://acme.test",
      faviconUrl: "https://www.google.com/s2/favicons?sz=128&domain_url=https%3A%2F%2Facme.test",
      weight: 3,
      meta: { description: "Modern hosting" },
      fields: [
        {
          id: "field_description",
          name: "description",
          type: "Textarea",
          value: "Modern hosting",
        },
      ],
    })

    expect(findManyCalls[0]?.where).toEqual({
      status: "Approved",
      id: { notIn: ["ad_old"] },
      subscription: {
        workspaceId: "ws_openads",
        status: { in: ["Active", "Trialing"] },
        tier: { weight: { gte: 2.5 } },
      },
    })
  })

  it("returns null when no eligible ads exist", async () => {
    const { db } = createDb([])

    await expect(findServingAd({ db: db as never, workspaceId: "ws_openads" })).resolves.toBeNull()
  })
})

describe("findServingAds", () => {
  it("returns an empty list when no eligible ads exist", async () => {
    const { db } = createDb([])

    await expect(findServingAds({ db: db as never, workspaceId: "ws_openads" })).resolves.toEqual(
      [],
    )
  })

  it("threads selected ads through excludeIds during multi-ad rotation", async () => {
    const { db, findManyCalls } = createDb([adRow])

    const ads = await findServingAds({
      db: db as never,
      workspaceId: "ws_openads",
      count: 2,
    })

    expect(ads).toHaveLength(1)
    expect(findManyCalls[1]?.where?.id?.notIn).toEqual(["ad_gold"])
  })
})
