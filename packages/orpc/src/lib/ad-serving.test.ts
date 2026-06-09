import { describe, expect, it } from "bun:test"
import { findServingAd, findServingAds } from "./ad-serving"

const goldAdRow = {
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

const silverAdRow = {
  id: "ad_silver",
  name: "Acme Silver",
  websiteUrl: "https://silver.test",
  subscription: { tier: { weight: 1 } },
  meta: [],
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

const createDb = (rows: Array<typeof goldAdRow | typeof silverAdRow>) => {
  const findManyCalls: Array<FindManyArgs> = []
  const groupByCalls: Array<unknown> = []

  const db = {
    ad: {
      findMany: async (args: FindManyArgs) => {
        findManyCalls.push(args)
        const excluded = new Set(args.where?.id?.notIn ?? [])
        return rows.filter(row => !excluded.has(row.id))
      },
    },
    adStat: {
      groupBy: async (args: unknown) => {
        groupByCalls.push(args)
        return []
      },
    },
  }

  return { db, findManyCalls, groupByCalls }
}

describe("findServingAd", () => {
  it("queries only approved ads with active subscriptions and placement filters", async () => {
    const { db, findManyCalls } = createDb([goldAdRow])

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

  it("skips the stats query when only one ad is eligible", async () => {
    const { db, groupByCalls } = createDb([goldAdRow])

    const ad = await findServingAd({ db: db as never, workspaceId: "ws_openads" })

    expect(ad?.id).toBe("ad_gold")
    expect(groupByCalls).toHaveLength(0)
  })
})

describe("findServingAds", () => {
  it("returns an empty list when no eligible ads exist", async () => {
    const { db } = createDb([])

    await expect(findServingAds({ db: db as never, workspaceId: "ws_openads" })).resolves.toEqual(
      [],
    )
  })

  it("fetches the pool and stats once, then samples without replacement", async () => {
    const { db, findManyCalls, groupByCalls } = createDb([goldAdRow, silverAdRow])

    const ads = await findServingAds({
      db: db as never,
      workspaceId: "ws_openads",
      count: 2,
    })

    expect(ads).toHaveLength(2)
    expect(new Set(ads.map(ad => ad.id))).toEqual(new Set(["ad_gold", "ad_silver"]))
    expect(findManyCalls).toHaveLength(1)
    expect(groupByCalls).toHaveLength(1)
  })

  it("passes the initial excludeIds into the pool query", async () => {
    const { db, findManyCalls } = createDb([goldAdRow, silverAdRow])

    const ads = await findServingAds({
      db: db as never,
      workspaceId: "ws_openads",
      excludeIds: ["ad_silver"],
      count: 2,
    })

    expect(findManyCalls[0]?.where?.id?.notIn).toEqual(["ad_silver"])
    expect(ads.map(ad => ad.id)).toEqual(["ad_gold"])
  })

  it("caps the result at the eligible pool size", async () => {
    const { db, findManyCalls } = createDb([goldAdRow])

    const ads = await findServingAds({
      db: db as never,
      workspaceId: "ws_openads",
      count: 5,
    })

    expect(ads).toHaveLength(1)
    expect(findManyCalls).toHaveLength(1)
  })
})
