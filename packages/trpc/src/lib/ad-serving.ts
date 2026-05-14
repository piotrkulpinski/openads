import type { db } from "@openads/db"

export interface ServingCandidate {
  id: string
  weight: number
  name: string
  websiteUrl: string
  meta: Array<{ fieldId: string; value: unknown }>
}

interface FindServingAdProps {
  db: typeof db
  workspaceId: string
  /** Optional minimum effective weight floor (e.g. 2.5 for premium placements). */
  weightGte?: number
  excludeId?: string
  /** Maximum boost applied to the least-served ad (1.2 = +20%). */
  leastServedBoostMax?: number
  /**
   * Number of UTC days of impression history to consider when computing
   * least-served fairness. 1 = today only, 7 = last week, etc. Matches the
   * day-bucketed granularity of `AdStat`.
   */
  fairnessWindowDays?: number
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
export async function findServingAd({
  db,
  workspaceId,
  weightGte,
  excludeId,
  leastServedBoostMax = 1.2,
  fairnessWindowDays = 1,
}: FindServingAdProps): Promise<ServingCandidate | null> {
  const rows = await db.ad.findMany({
    where: {
      status: "Approved",
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
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
      meta: { select: { fieldId: true, value: true } },
    },
  })

  const ads: ServingCandidate[] = rows.map(r => ({
    id: r.id,
    name: r.name,
    websiteUrl: r.websiteUrl,
    weight: r.subscription.tier.weight,
    meta: r.meta,
  }))

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
      adId: { in: ads.map(a => a.id) },
      date: { gte: since },
    },
    _sum: { impressions: true },
  })

  const impressionsByAd = new Map<string, number>(stats.map(s => [s.adId, s._sum.impressions ?? 0]))

  const counts = ads.map(a => impressionsByAd.get(a.id) ?? 0)
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

  const total = weighted.reduce((sum, w) => sum + w.effectiveWeight, 0)
  if (total <= 0) return ads[0] ?? null

  let cursor = Math.random() * total
  for (const { ad, effectiveWeight } of weighted) {
    cursor -= effectiveWeight
    if (cursor <= 0) return ad
  }
  return weighted[0]?.ad ?? null
}
