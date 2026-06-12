import { AdStatus } from "@openads/db/client"
import { isServingSubscription, SERVING_SUBSCRIPTION_STATUSES } from "@openads/db/lib/subscription"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"
import { startOfUtcDay } from "../lib/date"
import { sumMonthlyCents } from "../lib/revenue"

export const advertiserRouter = {
  getAll: authProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        query: z.string().trim().optional(),
      }),
    )
    .use(workspaceMw)
    .handler(async ({ context: { db, workspace }, input: { query } }) => {
      const subscriptionFilter = { workspaceId: workspace.id, ad: { isNot: null } }

      const advertisers = await db.advertiser.findMany({
        where: {
          workspaceId: workspace.id,
          subscriptions: { some: subscriptionFilter },
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                  {
                    subscriptions: {
                      some: {
                        workspaceId: workspace.id,
                        ad: { is: { name: { contains: query, mode: "insensitive" } } },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { subscriptions: { where: subscriptionFilter } },
          },
          subscriptions: {
            where: subscriptionFilter,
            orderBy: { ad: { updatedAt: "desc" } },
            take: 1,
            include: {
              ad: true,
              tier: true,
            },
          },
        },
      })

      const advertiserIds = advertisers.map(advertiser => advertiser.id)

      const [activeSubscriptionCounts, activeAdCounts] = advertiserIds.length
        ? await Promise.all([
            db.subscription.groupBy({
              by: ["advertiserId"],
              where: {
                ...subscriptionFilter,
                advertiserId: { in: advertiserIds },
                status: { in: SERVING_SUBSCRIPTION_STATUSES },
              },
              _count: true,
            }),
            db.subscription.groupBy({
              by: ["advertiserId"],
              where: {
                workspaceId: workspace.id,
                advertiserId: { in: advertiserIds },
                status: { in: SERVING_SUBSCRIPTION_STATUSES },
                ad: { is: { status: AdStatus.Approved } },
              },
              _count: true,
            }),
          ])
        : [[], []]

      const activeSubscriptionCountById = new Map(
        activeSubscriptionCounts.map(row => [row.advertiserId, row._count]),
      )
      const activeAdCountById = new Map(activeAdCounts.map(row => [row.advertiserId, row._count]))

      return advertisers.map(advertiser => {
        const latestSubscription = advertiser.subscriptions[0]
        const latestAd = latestSubscription?.ad ?? null

        return {
          id: advertiser.id,
          name: advertiser.name,
          email: advertiser.email,
          createdAt: advertiser.createdAt,
          updatedAt: advertiser.updatedAt,
          adCount: advertiser._count.subscriptions,
          activeAdCount: activeAdCountById.get(advertiser.id) ?? 0,
          activeSubscriptionCount: activeSubscriptionCountById.get(advertiser.id) ?? 0,
          latestActivityAt:
            latestAd?.updatedAt ?? latestSubscription?.updatedAt ?? advertiser.updatedAt,
          latestAd: latestAd
            ? {
                id: latestAd.id,
                name: latestAd.name,
                status: latestAd.status,
                websiteUrl: latestAd.websiteUrl,
                faviconUrl: latestAd.faviconUrl,
              }
            : null,
          latestTier: latestSubscription
            ? {
                id: latestSubscription.tier.id,
                name: latestSubscription.tier.name,
                weight: latestSubscription.tier.weight,
              }
            : null,
        }
      })
    }),

  getById: authProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        advertiserId: z.string().min(1),
      }),
    )
    .use(workspaceMw)
    .handler(async ({ context: { db, workspace }, input: { advertiserId } }) => {
      const since = startOfUtcDay(29)

      const advertiser = await db.advertiser.findFirst({
        where: {
          id: advertiserId,
          workspaceId: workspace.id,
          subscriptions: {
            some: {
              workspaceId: workspace.id,
              ad: { isNot: null },
            },
          },
        },
        include: {
          subscriptions: {
            where: {
              workspaceId: workspace.id,
              ad: { isNot: null },
            },
            include: {
              ad: {
                include: {
                  stats: {
                    where: { date: { gte: since } },
                    select: {
                      impressions: true,
                      clicks: true,
                    },
                  },
                },
              },
              tier: true,
              tierPrice: true,
            },
            orderBy: [{ ad: { updatedAt: "desc" } }, { createdAt: "desc" }],
          },
        },
      })

      if (!advertiser) {
        throw new ORPCError("NOT_FOUND")
      }

      const ads = advertiser.subscriptions.flatMap(subscription => {
        const ad = subscription.ad
        if (!ad) return []

        const stats = ad.stats.reduce(
          (total, row) => {
            return {
              impressions: total.impressions + row.impressions,
              clicks: total.clicks + row.clicks,
            }
          },
          { impressions: 0, clicks: 0 },
        )

        return [
          {
            id: ad.id,
            name: ad.name,
            status: ad.status,
            websiteUrl: ad.websiteUrl,
            faviconUrl: ad.faviconUrl,
            createdAt: ad.createdAt,
            updatedAt: ad.updatedAt,
            reviewedAt: ad.reviewedAt,
            rejectionNote: ad.rejectionNote,
            stats,
            subscription: {
              id: subscription.id,
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              createdAt: subscription.createdAt,
              updatedAt: subscription.updatedAt,
              tier: subscription.tier,
              tierPrice: subscription.tierPrice,
            },
          },
        ]
      })

      const paid = ads.filter(ad => isServingSubscription(ad.subscription.status))

      const totals = ads.reduce(
        (total, ad) => {
          const isActive =
            ad.status === AdStatus.Approved && isServingSubscription(ad.subscription.status)

          return {
            ...total,
            ads: total.ads + 1,
            activeAds: total.activeAds + (isActive ? 1 : 0),
            activeSubscriptions:
              total.activeSubscriptions + (isServingSubscription(ad.subscription.status) ? 1 : 0),
            impressions: total.impressions + ad.stats.impressions,
            clicks: total.clicks + ad.stats.clicks,
          }
        },
        {
          ads: 0,
          activeAds: 0,
          activeSubscriptions: 0,
          impressions: 0,
          clicks: 0,
          // Normalized monthly revenue across paid subscriptions, matching
          // the dashboard's revenue figure for this advertiser's slice.
          monthlyCents: sumMonthlyCents(paid.map(ad => ad.subscription)),
          currency: paid[0]?.subscription.tierPrice.currency ?? "usd",
        },
      )

      return {
        id: advertiser.id,
        name: advertiser.name,
        email: advertiser.email,
        createdAt: advertiser.createdAt,
        updatedAt: advertiser.updatedAt,
        totals,
        latestAd: ads[0] ?? null,
        ads,
      }
    }),
}
