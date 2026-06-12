import { AdStatus, SubscriptionStatus } from "@openads/db/client"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, workspaceMw } from "../index"

const isActiveSubscriptionStatus = (status: SubscriptionStatus) => {
  return status === SubscriptionStatus.Active || status === SubscriptionStatus.Trialing
}

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
      const search = query?.trim()
      const subscriptionFilter = { workspaceId: workspace.id, ad: { isNot: null } }

      const advertisers = await db.advertiser.findMany({
        where: {
          workspaceId: workspace.id,
          subscriptions: { some: subscriptionFilter },
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  {
                    subscriptions: {
                      some: {
                        workspaceId: workspace.id,
                        ad: { is: { name: { contains: search, mode: "insensitive" } } },
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
      const activeStatuses = [SubscriptionStatus.Active, SubscriptionStatus.Trialing]

      const [activeSubscriptionCounts, activeAdCounts] = advertiserIds.length
        ? await Promise.all([
            db.subscription.groupBy({
              by: ["advertiserId"],
              where: {
                ...subscriptionFilter,
                advertiserId: { in: advertiserIds },
                status: { in: activeStatuses },
              },
              _count: true,
            }),
            db.subscription.groupBy({
              by: ["advertiserId"],
              where: {
                workspaceId: workspace.id,
                advertiserId: { in: advertiserIds },
                status: { in: activeStatuses },
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
      const since = new Date()
      since.setUTCHours(0, 0, 0, 0)
      since.setUTCDate(since.getUTCDate() - 29)

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
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (!advertiser) {
        throw new ORPCError("NOT_FOUND")
      }

      const ads = advertiser.subscriptions
        .flatMap(subscription => {
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
              approvedAt: ad.approvedAt,
              rejectedAt: ad.rejectedAt,
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
        .sort((first, second) => {
          return second.updatedAt.getTime() - first.updatedAt.getTime()
        })

      const totals = ads.reduce(
        (total, ad) => {
          const isActive =
            ad.status === AdStatus.Approved && isActiveSubscriptionStatus(ad.subscription.status)

          return {
            ads: total.ads + 1,
            activeAds: total.activeAds + (isActive ? 1 : 0),
            activeSubscriptions:
              total.activeSubscriptions +
              (isActiveSubscriptionStatus(ad.subscription.status) ? 1 : 0),
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
