import { AdStatus, type Prisma, WorkspaceMemberRole } from "@openads/db/client"
import {
  AdApproved,
  AdChangesRequested,
  AdPendingReview,
  AdRejected,
  renderTemplate,
} from "@openads/emails"
import { fetchAndUploadFavicon } from "@openads/s3/favicon"
import { mapStripeSubscriptionStatus, toDate } from "@openads/stripe/subscription"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { adMw, authProcedure, type Context, publicProcedure, workspaceMw } from "../index"
import { findServingAds, servingAdSchema } from "../lib/ad-serving"
import { recordAdClick, recordAdImpression } from "../lib/ad-tracking"
import { startOfUtcDay } from "../lib/date"

const createFromCheckoutInput = z.object({
  workspaceId: z.string().min(1),
  sessionId: z.string().min(1),
  name: z.string().trim().min(2),
  // http(s) only — rendered as hrefs in the publisher dashboard
  websiteUrl: z.url({ protocol: /^https?$/ }),
  meta: z
    .array(z.object({ fieldId: z.string(), value: z.unknown() }))
    .optional()
    .default([]),
})

const checkoutSessionInput = z.object({
  workspaceId: z.string().min(1),
  sessionId: z.string().min(1),
})

const adIdentitySchema = z.object({
  workspaceId: z.string(),
  adId: z.string(),
})

const trackingResultSchema = z.object({ success: z.boolean() })

const getConnectedCheckoutSession = async ({
  db,
  stripe,
  workspaceId,
  sessionId,
}: Pick<Context, "db" | "stripe"> & { workspaceId: string; sessionId: string }) => {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, slug: true, faviconUrl: true, stripeConnectId: true },
  })

  if (!workspace?.stripeConnectId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "This publisher cannot accept payments yet.",
    })
  }

  const session = await stripe.checkout.sessions.retrieve(
    sessionId,
    {},
    { stripeAccount: workspace.stripeConnectId },
  )

  if (session.metadata?.workspaceId !== workspaceId) {
    throw new ORPCError("BAD_REQUEST", { message: "Checkout workspace mismatch." })
  }

  return { session, workspace, connectedAccountId: workspace.stripeConnectId }
}

// ---- SDK-facing public procedures (re-exported via `publicRouter`) ----

// Exported so apps/api can derive its edge-cache path matcher from the same
// declaration — keeping the route and the cache rule from silently drifting.
export const ADS_CURRENT_PATH = "/workspaces/{slug}/ads/current"

export const getCurrentAds = publicProcedure
  .route({
    method: "GET",
    path: ADS_CURRENT_PATH,
    tags: ["Ads"],
    summary: "Fetch ads currently serving for a workspace",
  })
  .input(
    z.object({
      slug: z.string(),
      weightGte: z.number().positive().optional(),
      // The SDK serializes `excludeIds` as a single comma-joined query value
      // (`?excludeIds=a,b`). The OpenAPI deserializer only builds arrays from
      // bracket/repeated notation, so split the comma form here while still
      // accepting a real array if a caller sends one.
      excludeIds: z
        .preprocess(value => {
          if (Array.isArray(value)) return value
          if (typeof value === "string") {
            return value
              .split(",")
              .map(id => id.trim())
              .filter(Boolean)
          }
          return []
        }, z.array(z.string()))
        .default([]),
      count: z.number().int().min(1).max(20).default(1),
    }),
  )
  .output(z.object({ ads: z.array(servingAdSchema) }))
  .handler(async ({ context: { db }, input }) => {
    const workspace = await db.workspace.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    })

    if (!workspace) {
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found." })
    }

    const ads = await findServingAds({
      db,
      workspaceId: workspace.id,
      weightGte: input.weightGte,
      excludeIds: input.excludeIds,
      count: input.count,
    })

    return { ads }
  })

export const recordImpression = publicProcedure
  .route({
    method: "POST",
    path: "/ads/{adId}/impression",
    tags: ["Tracking"],
    summary: "Record an ad impression",
  })
  .input(z.object({ adId: z.string() }))
  .output(trackingResultSchema)
  .handler(async ({ context: { db, redis, clientIp }, input: { adId } }) => {
    return await recordAdImpression({ db, redis, clientIp, adId })
  })

export const recordClick = publicProcedure
  .route({
    method: "POST",
    path: "/ads/{adId}/click",
    tags: ["Tracking"],
    summary: "Record an ad click",
  })
  .input(z.object({ adId: z.string() }))
  .output(trackingResultSchema)
  .handler(async ({ context: { db, redis, clientIp }, input: { adId } }) => {
    return await recordAdClick({ db, redis, clientIp, adId })
  })

// ---- Internal RPC procedures (consumed by apps/app) ----

const getCheckoutInfo = publicProcedure
  .input(checkoutSessionInput)
  .handler(async ({ context: { db, stripe }, input: { workspaceId, sessionId } }) => {
    const { session, workspace } = await getConnectedCheckoutSession({
      db,
      stripe,
      workspaceId,
      sessionId,
    })

    if (session.status !== "complete") {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Checkout has not completed yet.",
      })
    }

    const metadata = session.metadata
    const tierPriceId = metadata?.tierPriceId

    if (!tierPriceId) {
      throw new ORPCError("BAD_REQUEST", { message: "Missing checkout metadata." })
    }

    const [tierPrice, fields, existingAd] = await Promise.all([
      // Scoped to the workspace — session metadata is publisher-controlled,
      // so an unscoped lookup would let it point at another tenant's price.
      db.tierPrice.findFirst({
        where: { id: tierPriceId, tier: { workspaceId } },
        select: {
          id: true,
          interval: true,
          intervalCount: true,
          amount: true,
          currency: true,
          tier: { select: { id: true, name: true, weight: true } },
        },
      }),
      db.field.findMany({
        where: { workspaceId },
        orderBy: { order: "asc" },
      }),
      (async () => {
        if (typeof session.subscription !== "string") return null
        return await db.ad.findFirst({
          where: { subscription: { stripeSubscriptionId: session.subscription } },
          include: { meta: true },
        })
      })(),
    ])

    if (!tierPrice) {
      throw new ORPCError("NOT_FOUND")
    }

    return {
      // Picked shape — this is an unauthenticated procedure, so the helper's
      // `stripeConnectId` must not leak into the response.
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        faviconUrl: workspace.faviconUrl,
      },
      tier: tierPrice.tier,
      tierPrice,
      fields,
      existingAd,
    }
  })

// Gated only by the Stripe Checkout session id, which isn't a secret — it
// lives in the success-URL query string. The safeguard against malicious
// overwrites is that every submission resets `status` to Pending, so a
// reviewer still has to approve before the creative serves.
const createFromCheckout = publicProcedure
  .input(createFromCheckoutInput)
  .handler(
    async ({
      context: { db, emails, logger, s3, stripe, env },
      input: { workspaceId, sessionId, name, websiteUrl, meta },
    }) => {
      const { connectedAccountId, session, workspace } = await getConnectedCheckoutSession({
        db,
        stripe,
        workspaceId,
        sessionId,
      })

      if (session.status !== "complete") {
        throw new ORPCError("PRECONDITION_FAILED", {
          message: "Checkout has not completed yet.",
        })
      }

      if (typeof session.subscription !== "string") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Checkout session has no subscription.",
        })
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription,
        {},
        { stripeAccount: connectedAccountId },
      )
      const metadata = stripeSubscription.metadata ?? session.metadata
      const tierPriceId = metadata?.tierPriceId
      // Stripe collects the email on its hosted page (we no longer pre-fill
      // `customer_email`), so it lands in `customer_details.email`.
      const customerEmail = session.customer_details?.email ?? session.customer_email

      if (!tierPriceId || !customerEmail) {
        throw new ORPCError("BAD_REQUEST", { message: "Missing checkout metadata." })
      }

      const tierPrice = await db.tierPrice.findUnique({
        where: { id: tierPriceId },
        select: {
          id: true,
          tierId: true,
          tier: { select: { id: true, name: true, weight: true, workspaceId: true } },
        },
      })

      if (!tierPrice || tierPrice.tier.workspaceId !== workspaceId) {
        throw new ORPCError("NOT_FOUND")
      }

      const tier = tierPrice.tier

      const advertiser = await db.advertiser.upsert({
        where: { workspaceId_email: { workspaceId, email: customerEmail } },
        update: {},
        create: {
          workspaceId,
          email: customerEmail,
          name: name.slice(0, 80),
        },
      })

      // Idempotent — the Stripe webhook may have already created this row.
      const subscription = await db.subscription.upsert({
        where: { stripeSubscriptionId: stripeSubscription.id },
        create: {
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId:
            typeof stripeSubscription.customer === "string"
              ? stripeSubscription.customer
              : stripeSubscription.customer.id,
          status: mapStripeSubscriptionStatus(stripeSubscription.status),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodStart: toDate(stripeSubscription.items.data[0]?.current_period_start),
          currentPeriodEnd: toDate(stripeSubscription.items.data[0]?.current_period_end),
          workspaceId,
          tierId: tier.id,
          tierPriceId: tierPrice.id,
          advertiserId: advertiser.id,
        },
        update: {
          status: mapStripeSubscriptionStatus(stripeSubscription.status),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodStart: toDate(stripeSubscription.items.data[0]?.current_period_start),
          currentPeriodEnd: toDate(stripeSubscription.items.data[0]?.current_period_end),
        },
      })

      const ad = await db.ad.upsert({
        where: { subscriptionId: subscription.id },
        create: {
          subscriptionId: subscription.id,
          status: "Pending",
          name,
          websiteUrl,
        },
        update: {
          name,
          websiteUrl,
          // Resubmission re-enters the review queue.
          status: "Pending",
          reviewedAt: null,
          rejectionNote: null,
        },
      })

      // Best-effort — failure is logged but doesn't block ad creation. The
      // R2 URL is persisted so serving and dashboards never reference the
      // third-party logo service directly.
      const faviconUrl = await fetchAndUploadFavicon(s3, {
        websiteUrl,
        logoLinkClientId: env.LOGO_LINK_CLIENT_ID,
        key: `workspaces/${workspaceId}/ads/${ad.id}/favicon.png`,
      }).catch(err => {
        logger.warn("ad.createFromCheckout: favicon fetch failed", {
          err,
          adId: ad.id,
          websiteUrl,
        })
        return null
      })

      if (faviconUrl) {
        await db.ad.update({ where: { id: ad.id }, data: { faviconUrl } })
      }

      // Transactional replace so concurrent reads never see an ad with zero
      // meta rows between the delete and the recreate. Always runs — an empty
      // resubmission must clear the old meta rows too.
      const validFieldIds = new Set(
        (await db.field.findMany({ where: { workspaceId }, select: { id: true } })).map(f => f.id),
      )
      const filtered = meta.filter(m => validFieldIds.has(m.fieldId))

      await db.$transaction([
        db.meta.deleteMany({ where: { adId: ad.id } }),
        ...(filtered.length > 0
          ? [
              db.meta.createMany({
                data: filtered.map(m => ({
                  adId: ad.id,
                  fieldId: m.fieldId,
                  value: m.value as Prisma.InputJsonValue,
                })),
              }),
            ]
          : []),
      ])

      // Notify workspace owners and managers.
      const reviewers = await db.workspaceMember.findMany({
        where: {
          workspaceId,
          role: { in: [WorkspaceMemberRole.Owner, WorkspaceMemberRole.Manager] },
        },
        include: { user: { select: { email: true, name: true } } },
      })

      if (reviewers.length > 0) {
        const { html, text } = await renderTemplate(
          AdPendingReview({
            workspaceName: workspace.name,
            advertiserName: advertiser.name,
            advertiserEmail: customerEmail,
            tierName: tier.name,
            reviewUrl: `${env.APP_URL}/${workspace.id}/ads/${ad.id}`,
          }),
        )

        const recipients = reviewers.flatMap(r =>
          r.user.email ? [{ email: r.user.email, name: r.user.name }] : [],
        )

        await Promise.all(
          recipients.map(to =>
            emails.send({ to, subject: `New ad pending review on ${workspace.name}`, html, text }),
          ),
        )
      }

      return { adId: ad.id, subscriptionId: subscription.id }
    },
  )

export const adRouter = {
  // Workspace dashboard surface.
  getAll: authProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.enum(AdStatus).optional(),
      }),
    )
    .use(workspaceMw)
    .handler(async ({ context: { db, workspace }, input: { status } }) => {
      return await db.ad.findMany({
        where: {
          subscription: { workspaceId: workspace.id },
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: {
              advertiser: true,
              tier: true,
              tierPrice: true,
            },
          },
        },
      })
    }),

  getById: authProcedure
    .input(adIdentitySchema)
    .use(adMw)
    .handler(({ context: { ad } }) => ad),

  // Per-ad daily stats over a date range, defaulting to the past 30 days.
  getStats: authProcedure
    .input(adIdentitySchema.extend({ days: z.number().int().min(1).max(180).default(30) }))
    .use(adMw)
    .handler(async ({ context: { ad, db }, input: { days } }) => {
      const since = startOfUtcDay(days - 1)

      const rows = await db.adStat.findMany({
        where: { adId: ad.id, date: { gte: since } },
        orderBy: { date: "asc" },
        select: { date: true, impressions: true, clicks: true },
      })

      const totals = rows.reduce(
        (acc, r) => ({
          impressions: acc.impressions + r.impressions,
          clicks: acc.clicks + r.clicks,
        }),
        { impressions: 0, clicks: 0 },
      )

      return { rows, totals, days }
    }),

  approve: authProcedure
    .input(adIdentitySchema.extend({ note: z.string().trim().max(500).optional() }))
    .use(adMw)
    .handler(async ({ context: { ad, db, emails, workspace }, input: { note } }) => {
      const updated = await db.ad.update({
        where: { id: ad.id },
        data: {
          status: AdStatus.Approved,
          reviewedAt: new Date(),
          rejectionNote: null,
        },
      })

      const advertiserEmail = ad.subscription.advertiser.email
      if (advertiserEmail) {
        const { html, text } = await renderTemplate(
          AdApproved({
            workspaceName: workspace.name,
            adName: ad.name,
            approvalNote: note,
          }),
        )

        await emails.send({
          to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
          subject: `Your ad on ${workspace.name} is now live`,
          html,
          text,
        })
      }

      return updated
    }),

  reject: authProcedure
    .input(adIdentitySchema.extend({ note: z.string().trim().min(1).max(500) }))
    .use(adMw)
    .handler(
      async ({ context: { ad, db, emails, logger, stripe, workspace }, input: { note } }) => {
        const updated = await db.ad.update({
          where: { id: ad.id },
          data: {
            status: AdStatus.Rejected,
            reviewedAt: new Date(),
            rejectionNote: note,
          },
        })

        // Cancel the underlying Stripe subscription so the advertiser stops being billed.
        try {
          if (!workspace.stripeConnectId) {
            throw new Error("Workspace has no connected Stripe account")
          }

          await stripe.subscriptions.cancel(
            ad.subscription.stripeSubscriptionId,
            {},
            { stripeAccount: workspace.stripeConnectId },
          )
        } catch (err) {
          // Subscription may already be canceled or otherwise inaccessible — leave
          // local state correct and surface the failure in logs only.
          logger.warn("ad.reject: failed to cancel stripe subscription", {
            err,
            stripeSubscriptionId: ad.subscription.stripeSubscriptionId,
            adId: ad.id,
          })
        }

        const advertiserEmail = ad.subscription.advertiser.email
        if (advertiserEmail) {
          const { html, text } = await renderTemplate(
            AdRejected({
              workspaceName: workspace.name,
              adName: ad.name,
              rejectionNote: note,
            }),
          )

          await emails.send({
            to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
            subject: `Your ad on ${workspace.name} was not approved`,
            html,
            text,
          })
        }

        return updated
      },
    ),

  requestChanges: authProcedure
    .input(adIdentitySchema.extend({ note: z.string().trim().min(1).max(500) }))
    .use(adMw)
    .handler(async ({ context: { ad, db, emails, workspace }, input: { note } }) => {
      const updated = await db.ad.update({
        where: { id: ad.id },
        data: {
          status: AdStatus.Pending,
          reviewedAt: null,
          // Unlike a resubmission, the note stays so the advertiser can see
          // what to change.
          rejectionNote: note,
        },
      })

      const advertiserEmail = ad.subscription.advertiser.email
      if (advertiserEmail) {
        const { html, text } = await renderTemplate(
          AdChangesRequested({
            workspaceName: workspace.name,
            adName: ad.name,
            changesNote: note,
          }),
        )

        await emails.send({
          to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
          subject: "Changes requested on your ad",
          html,
          text,
        })
      }

      return updated
    }),

  // Unauthenticated checkout flow used internally by apps/app
  // (advertise/success, embed/*). NOT part of the `/v1` REST surface — those
  // endpoints live in `publicRouter`. Named `checkout` (not `public`) so it
  // doesn't read as the `publicRouter` REST surface.
  checkout: {
    getCheckoutInfo,
    createFromCheckout,
  },
}
