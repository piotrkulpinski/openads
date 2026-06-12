import type { db } from "@openads/db"
import { FieldType } from "@openads/db/client"
import { z } from "zod"

// Single source of truth for the ad-serving shape. The SDK `/v1` endpoint
// `.output()`, the embed serving shape, and the runtime types all derive from
// these schemas, so the OpenAPI spec and the code can't drift apart.
export const servingFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(FieldType),
  value: z.unknown(),
})

export const servingAdSchema = z.object({
  id: z.string(),
  name: z.string(),
  websiteUrl: z.string(),
  faviconUrl: z.string(),
  weight: z.number(),
  meta: z.record(z.string(), z.unknown()),
  fields: z.array(servingFieldSchema),
})

export type ServingFieldValue = z.infer<typeof servingFieldSchema>
export type ServingAd = z.infer<typeof servingAdSchema>

type FindServingAdProps = {
  db: typeof db
  workspaceId: string
  /** Optional minimum effective weight floor (e.g. 2.5 for premium placements). */
  weightGte?: number
  excludeIds?: Array<string>
  /** Maximum boost applied to the least-served ad (1.2 = +20%). */
  leastServedBoostMax?: number
  /**
   * Number of UTC days of impression history to consider when computing
   * least-served fairness. 1 = today only, 7 = last week, etc. Matches the
   * day-bucketed granularity of `AdStat`.
   */
  fairnessWindowDays?: number
}

type FindServingAdsProps = FindServingAdProps & {
  count?: number
}

const getMetaRecord = (fields: Array<ServingFieldValue>): Record<string, unknown> => {
  return Object.fromEntries(fields.map(field => [field.name, field.value]))
}

/**
 * Fetches the eligible ad pool for a workspace.
 * Filters: workspace matches, ad approved, subscription active or trialing.
 */
const fetchEligibleAds = async ({
  db,
  workspaceId,
  weightGte,
  excludeIds = [],
}: Pick<FindServingAdProps, "db" | "workspaceId" | "weightGte" | "excludeIds">): Promise<
  Array<ServingAd>
> => {
  const rows = await db.ad.findMany({
    where: {
      status: "Approved",
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      subscription: {
        workspaceId,
        status: { in: ["Active", "Trialing"] },
        // Weight is sourced live from the tier — applying the floor here
        // means tier weight edits affect placement targeting immediately.
        ...(weightGte !== undefined ? { tier: { weight: { gte: weightGte } } } : {}),
      },
    },
    select: {
      id: true,
      name: true,
      websiteUrl: true,
      faviconUrl: true,
      subscription: { select: { tier: { select: { weight: true } } } },
      meta: {
        select: {
          value: true,
          field: { select: { id: true, name: true, type: true } },
        },
      },
    },
  })

  return rows.map(row => {
    const fields = row.meta.map(item => ({
      id: item.field.id,
      name: item.field.name,
      type: item.field.type,
      value: item.value,
    }))

    return {
      id: row.id,
      name: row.name,
      websiteUrl: row.websiteUrl,
      faviconUrl: row.faviconUrl,
      weight: row.subscription.tier.weight,
      meta: getMetaRecord(fields),
      fields,
    }
  })
}

/**
 * Aggregates impressions per ad across the last N UTC days. `AdStat.date` is
 * the UTC midnight of a day bucket; subtracting (N - 1) days from today's
 * bucket gives the inclusive lower bound.
 */
const fetchImpressionsByAd = async ({
  db,
  adIds,
  fairnessWindowDays,
}: Pick<FindServingAdProps, "db"> & {
  adIds: Array<string>
  fairnessWindowDays: number
}): Promise<Map<string, number>> => {
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - Math.max(0, fairnessWindowDays - 1))

  const stats = await db.adStat.groupBy({
    by: ["adId"],
    where: {
      adId: { in: adIds },
      date: { gte: since },
    },
    _sum: { impressions: true },
  })

  return new Map<string, number>(stats.map(s => [s.adId, s._sum.impressions ?? 0]))
}

/**
 * Weighted random pick: weight × least-served boost, recomputed over the given
 * pool so the boost always reflects the candidates actually in contention.
 */
const pickWeightedAd = (
  ads: Array<ServingAd>,
  impressionsByAd: Map<string, number>,
  leastServedBoostMax: number,
): ServingAd | null => {
  if (ads.length === 0) return null
  if (ads.length === 1) return ads[0] ?? null

  const counts = ads.map(ad => impressionsByAd.get(ad.id) ?? 0)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const hasVariance = max > min

  const weighted = ads.map(ad => {
    const impressions = impressionsByAd.get(ad.id) ?? 0
    let effectiveWeight = ad.weight
    if (hasVariance) {
      const ratio = 1 - (impressions - min) / (max - min)
      effectiveWeight *= 1 + (leastServedBoostMax - 1) * ratio
    }
    return { ad, effectiveWeight }
  })

  const total = weighted.reduce((sum, item) => sum + item.effectiveWeight, 0)
  if (total <= 0) return ads[0] ?? null

  let cursor = Math.random() * total
  for (const { ad, effectiveWeight } of weighted) {
    cursor -= effectiveWeight
    if (cursor <= 0) return ad
  }
  return weighted[0]?.ad ?? null
}

/**
 * Picks an ad to serve for a workspace.
 * Filters: workspace matches, ad approved, subscription active or trialing.
 * Selection: weight × least-served boost, weighted random.
 *
 * Publishers handle placement targeting on their side via `weightGte` —
 * e.g. ask for `weight >= 2.5` for premium banner positions, anything for
 * regular cards. OpenAds doesn't carry a placement concept itself.
 */
export const findServingAd = async ({
  db,
  workspaceId,
  weightGte,
  excludeIds = [],
  leastServedBoostMax = 1.2,
  fairnessWindowDays = 1,
}: FindServingAdProps): Promise<ServingAd | null> => {
  const ads = await fetchEligibleAds({ db, workspaceId, weightGte, excludeIds })

  if (ads.length === 0) return null
  if (ads.length === 1) return ads[0] ?? null

  const impressionsByAd = await fetchImpressionsByAd({
    db,
    adIds: ads.map(ad => ad.id),
    fairnessWindowDays,
  })

  return pickWeightedAd(ads, impressionsByAd, leastServedBoostMax)
}

/**
 * Picks up to `count` distinct ads. Fetches the eligible pool and impression
 * stats once, then samples without replacement in memory — the least-served
 * boost is recomputed from the remaining pool on every pick, so the
 * distribution matches drawing one ad at a time.
 */
export const findServingAds = async ({
  db,
  workspaceId,
  weightGte,
  excludeIds = [],
  leastServedBoostMax = 1.2,
  fairnessWindowDays = 1,
  count = 1,
}: FindServingAdsProps): Promise<Array<ServingAd>> => {
  const limit = Math.max(1, Math.min(count, 20))
  const pool = await fetchEligibleAds({ db, workspaceId, weightGte, excludeIds })

  if (pool.length === 0) return []

  const impressionsByAd =
    pool.length > 1
      ? await fetchImpressionsByAd({ db, adIds: pool.map(ad => ad.id), fairnessWindowDays })
      : new Map<string, number>()

  const ads: Array<ServingAd> = []
  let remaining = pool

  while (ads.length < limit && remaining.length > 0) {
    const ad = pickWeightedAd(remaining, impressionsByAd, leastServedBoostMax)
    if (!ad) break

    ads.push(ad)
    remaining = remaining.filter(candidate => candidate.id !== ad.id)
  }

  return ads
}
