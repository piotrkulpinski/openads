import { isServingSubscription } from "@openads/db/lib/subscription"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"
import { startOfUtcDay } from "../lib/date"
import { sumMonthlyCents } from "../lib/revenue"

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
      const since = startOfUtcDay(29)

      const [subscriptions, statRows] = await Promise.all([
        db.subscription.findMany({
          where: { workspaceId: workspace.id, ad: { isNot: null } },
          orderBy: { ad: { createdAt: "desc" } },
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

      const paid = subscriptions.filter(sub => isServingSubscription(sub.status))

      const ads = subscriptions.flatMap(({ ad, ...subscription }) => {
        if (!ad) return []
        return [
          {
            id: ad.id,
            name: ad.name,
            websiteUrl: ad.websiteUrl,
            faviconUrl: ad.faviconUrl,
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
          monthlyCents: sumMonthlyCents(paid),
          currency: paid[0]?.tierPrice.currency ?? "usd",
          paidSubscriptions: paid.length,
        },
        counts: {
          ads: ads.length,
          servingAds: ads.filter(
            ad => ad.status === "Approved" && isServingSubscription(ad.subscription.status),
          ).length,
          pastDueSubscriptions: subscriptions.filter(sub => sub.status === "PastDue").length,
          advertisers: new Set(subscriptions.map(sub => sub.advertiserId)).size,
        },
        series,
        totals,
        pendingAds: ads.filter(ad => ad.status === "Pending"),
        recentAds: ads.slice(0, 5),
      }
    }),
}
