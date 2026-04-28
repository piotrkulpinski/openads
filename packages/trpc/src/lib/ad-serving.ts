import type { db } from "@openads/db"

export interface ServingCandidate {
  id: string
  weight: number
  name: string
  description: string
  websiteUrl: string
  faviconUrl: string
  bannerUrl: string
  buttonLabel: string
}

interface FindServingAdProps {
  db: typeof db
  workspaceId: string
  zoneId: string
  excludeId?: string
  /** Maximum boost applied to the least-served ad (1.2 = +20%). */
  leastServedBoostMax?: number
  /** Window in hours for impression-based fairness. */
  fairnessWindowHours?: number
}

/**
 * Picks an ad to serve in a zone, scoped to a workspace.
 * Filters: zone matches, ad approved, subscription active or trialing.
 * Selection: weight × least-served boost, weighted random.
 */
export async function findServingAd({
  db,
  workspaceId,
  zoneId,
  excludeId,
  leastServedBoostMax = 1.2,
  fairnessWindowHours = 24,
}: FindServingAdProps): Promise<ServingCandidate | null> {
  const ads = await db.ad.findMany({
    where: {
      status: "Approved",
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      subscription: {
        workspaceId,
        package: { zoneId },
        status: { in: ["Active", "Trialing"] },
      },
    },
    select: {
      id: true,
      weight: true,
      name: true,
      description: true,
      websiteUrl: true,
      faviconUrl: true,
      bannerUrl: true,
      buttonLabel: true,
    },
  })

  if (ads.length === 0) return null
  if (ads.length === 1) return ads[0] ?? null

  // Aggregate impressions across the fairness window.
  const since = new Date(Date.now() - fairnessWindowHours * 60 * 60 * 1000)
  since.setUTCHours(0, 0, 0, 0)

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
