import type { BillingInterval } from "@openads/db/client"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"

const MONTHS_PER_INTERVAL: Record<BillingInterval, number> = {
  Day: 1 / 30,
  Week: 7 / 30,
  Month: 1,
  Year: 12,
}

const isPaid = (status: string) => status === "Active" || status === "Trialing"

export const dashboardRouter = {
  /**
   * Everything the workspace overview needs in one round trip: normalized
   * monthly revenue, serving/pending counts, a 30-day traffic series summed
   * across all ads, the review queue, and the latest submissions.
   */
  get: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db, workspace } }) => {
      const since = new Date()
      since.setUTCHours(0, 0, 0, 0)
      since.setUTCDate(since.getUTCDate() - 29)

      const [subscriptions, statRows] = await Promise.all([
        db.subscription.findMany({
          where: { workspaceId: workspace.id, ad: { isNot: null } },
          include: { ad: true, tier: true, tierPrice: true, advertiser: true },
        }),
        db.adStat.groupBy({
          by: ["date"],
          where: {
            date: { gte: since },
            ad: { is: { subscription: { is: { workspaceId: workspace.id } } } },
          },
          _sum: { impressions: true, clicks: true },
          orderBy: { date: "asc" },
        }),
      ])

      const paid = subscriptions.filter(sub => isPaid(sub.status))
      const monthlyCents = paid.reduce((total, { tierPrice }) => {
        const months = MONTHS_PER_INTERVAL[tierPrice.interval] * tierPrice.intervalCount
        return total + tierPrice.amount / months
      }, 0)

      const ads = subscriptions.flatMap(({ ad, ...subscription }) => {
        if (!ad) return []
        return [
          {
            id: ad.id,
            name: ad.name,
            websiteUrl: ad.websiteUrl,
            status: ad.status,
            createdAt: ad.createdAt,
            advertiser: {
              id: subscription.advertiser.id,
              name: subscription.advertiser.name,
              email: subscription.advertiser.email,
            },
            tier: { name: subscription.tier.name },
            subscription: { status: subscription.status },
          },
        ]
      })

      const byNewest = [...ads].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      const series = statRows.map(row => ({
        date: row.date,
        impressions: row._sum.impressions ?? 0,
        clicks: row._sum.clicks ?? 0,
      }))

      const totals = series.reduce(
        (acc, row) => ({
          impressions: acc.impressions + row.impressions,
          clicks: acc.clicks + row.clicks,
        }),
        { impressions: 0, clicks: 0 },
      )

      return {
        revenue: {
          monthlyCents: Math.round(monthlyCents),
          currency: paid[0]?.tierPrice.currency ?? "usd",
          paidSubscriptions: paid.length,
        },
        counts: {
          ads: ads.length,
          servingAds: ads.filter(ad => ad.status === "Approved" && isPaid(ad.subscription.status))
            .length,
          pastDueSubscriptions: subscriptions.filter(sub => sub.status === "PastDue").length,
          advertisers: new Set(subscriptions.map(sub => sub.advertiserId)).size,
        },
        series,
        totals,
        pendingAds: byNewest.filter(ad => ad.status === "Pending"),
        recentAds: byNewest.slice(0, 5),
      }
    }),
}
