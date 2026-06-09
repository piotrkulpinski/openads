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

const getFaviconUrl = (websiteUrl: string): string => {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(websiteUrl)}`
}

const getMetaRecord = (fields: Array<ServingFieldValue>): Record<string, unknown> => {
  return Object.fromEntries(fields.map(field => [field.name, field.value]))
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
      subscription: { select: { tier: { select: { weight: true } } } },
      meta: {
        select: {
          value: true,
          field: { select: { id: true, name: true, type: true } },
        },
      },
    },
  })

  const ads: Array<ServingAd> = rows.map(row => {
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
      faviconUrl: getFaviconUrl(row.websiteUrl),
      weight: row.subscription.tier.weight,
      meta: getMetaRecord(fields),
      fields,
    }
  })

  if (ads.length === 0) return null
  if (ads.length === 1) return ads[0] ?? null

  // Aggregate impressions across the last N UTC days. `AdStat.date` is the
  // UTC midnight of a day bucket; subtracting (N - 1) days from today's
  // bucket gives the inclusive lower bound.
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - Math.max(0, fairnessWindowDays - 1))

  const stats = await db.adStat.groupBy({
    by: ["adId"],
    where: {
      adId: { in: ads.map(ad => ad.id) },
      date: { gte: since },
    },
    _sum: { impressions: true },
  })

  const impressionsByAd = new Map<string, number>(stats.map(s => [s.adId, s._sum.impressions ?? 0]))

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

export const findServingAds = async ({
  count = 1,
  excludeIds = [],
  ...props
}: FindServingAdsProps): Promise<Array<ServingAd>> => {
  const ads: Array<ServingAd> = []
  const selectedIds = new Set(excludeIds)
  const limit = Math.max(1, Math.min(count, 20))

  for (let index = 0; index < limit; index += 1) {
    const ad = await findServingAd({
      ...props,
      excludeIds: Array.from(selectedIds),
    })

    if (!ad) break

    ads.push(ad)
    selectedIds.add(ad.id)
  }

  return ads
}
