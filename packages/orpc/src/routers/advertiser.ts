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

      const advertisers = await db.advertiser.findMany({
        where: {
          workspaceId: workspace.id,
          subscriptions: {
            some: {
              workspaceId: workspace.id,
              ad: { isNot: null },
            },
          },
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
          subscriptions: {
            where: {
              workspaceId: workspace.id,
              ad: { isNot: null },
            },
            include: {
              ad: true,
              tier: true,
              tierPrice: true,
            },
          },
        },
      })

      return advertisers
        .map(advertiser => {
          const subscriptions = advertiser.subscriptions.filter(subscription => subscription.ad)
          const latestSubscription = [...subscriptions].sort((first, second) => {
            const firstTime = first.ad?.updatedAt.getTime() ?? first.updatedAt.getTime()
            const secondTime = second.ad?.updatedAt.getTime() ?? second.updatedAt.getTime()
            return secondTime - firstTime
          })[0]
          const latestAd = latestSubscription?.ad ?? null

          const activeAdCount = subscriptions.filter(subscription => {
            return (
              subscription.ad?.status === AdStatus.Approved &&
              isActiveSubscriptionStatus(subscription.status)
            )
          }).length

          const activeSubscriptionCount = subscriptions.filter(subscription => {
            return isActiveSubscriptionStatus(subscription.status)
          }).length

          return {
            id: advertiser.id,
            name: advertiser.name,
            email: advertiser.email,
            createdAt: advertiser.createdAt,
            updatedAt: advertiser.updatedAt,
            adCount: subscriptions.length,
            activeAdCount,
            activeSubscriptionCount,
            latestActivityAt:
              latestAd?.updatedAt ?? latestSubscription?.updatedAt ?? advertiser.updatedAt,
            latestAd: latestAd
              ? {
                  id: latestAd.id,
                  name: latestAd.name,
                  status: latestAd.status,
                  websiteUrl: latestAd.websiteUrl,
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
        .sort((first, second) => {
          return second.latestActivityAt.getTime() - first.latestActivityAt.getTime()
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

      const subscriptions = advertiser.subscriptions.filter(subscription => subscription.ad)
      const ads = subscriptions
        .map(subscription => {
          const ad = subscription.ad!
          const stats = ad.stats.reduce(
            (total, row) => {
              return {
                impressions: total.impressions + row.impressions,
                clicks: total.clicks + row.clicks,
              }
            },
            { impressions: 0, clicks: 0 },
          )

          return {
            id: ad.id,
            name: ad.name,
            status: ad.status,
            websiteUrl: ad.websiteUrl,
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
          }
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
