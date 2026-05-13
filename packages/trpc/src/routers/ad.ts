import { WorkspaceMemberRole } from "@openads/db/client"
import { renderAdPendingReview } from "@openads/emails"
import { fetchAndUploadFavicon } from "@openads/s3/favicon"
import { mapStripeSubscriptionStatus, toDate } from "@openads/stripe/subscription"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { publicProcedure, router } from "../index"

const createFromCheckoutInput = z.object({
  sessionId: z.string().min(1),
  name: z.string().trim().min(2),
  websiteUrl: z.url(),
  meta: z
    .array(z.object({ fieldId: z.string(), value: z.any() }))
    .optional()
    .default([]),
})

export const adRouter = router({
  // Public surface used by the advertiser checkout success page.
  public: router({
    getCheckoutInfo: publicProcedure
      .input(z.object({ sessionId: z.string().min(1) }))
      .query(async ({ ctx: { db, stripe }, input: { sessionId } }) => {
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.status !== "complete") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Checkout has not completed yet.",
          })
        }

        const metadata = session.metadata
        const workspaceId = metadata?.workspaceId
        const packageId = metadata?.packageId

        if (!workspaceId || !packageId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Missing checkout metadata." })
        }

        const [workspace, pkg, fields, existingAd] = await Promise.all([
          db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, slug: true, faviconUrl: true },
          }),
          db.package.findUnique({
            where: { id: packageId },
            select: { id: true, name: true, weight: true, priceMonthly: true, currency: true },
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

        if (!workspace || !pkg) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }

        return {
          workspace,
          package: pkg,
          fields,
          customerEmail: session.customer_email ?? null,
          existingAd,
        }
      }),

    createFromCheckout: publicProcedure
      .input(createFromCheckoutInput)
      .mutation(
        async ({
          ctx: { db, emails, s3, stripe, env },
          input: { sessionId, name, websiteUrl, meta },
        }) => {
          const session = await stripe.checkout.sessions.retrieve(sessionId)

          if (session.status !== "complete") {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Checkout has not completed yet.",
            })
          }

          if (typeof session.subscription !== "string") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Checkout session has no subscription.",
            })
          }

          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription)
          const metadata = stripeSubscription.metadata ?? session.metadata
          const workspaceId = metadata?.workspaceId
          const packageId = metadata?.packageId
          const customerEmail = session.customer_email

          if (!workspaceId || !packageId || !customerEmail) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Missing checkout metadata." })
          }

          const pkg = await db.package.findUnique({
            where: { id: packageId },
            select: { id: true, name: true, weight: true, workspaceId: true },
          })

          if (!pkg || pkg.workspaceId !== workspaceId) {
            throw new TRPCError({ code: "NOT_FOUND" })
          }

          // Find or create the Advertiser by email within this workspace.
          let advertiser = await db.advertiser.findFirst({
            where: { workspaceId, email: customerEmail },
          })

          if (!advertiser) {
            advertiser = await db.advertiser.create({
              data: {
                workspaceId,
                email: customerEmail,
                name: name.slice(0, 80),
              },
            })
          }

          // Upsert the Subscription DB row from Stripe state (idempotent — the webhook
          // may have already created it).
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
              packageId,
              advertiserId: advertiser.id,
            },
            update: {
              status: mapStripeSubscriptionStatus(stripeSubscription.status),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              currentPeriodStart: toDate(stripeSubscription.items.data[0]?.current_period_start),
              currentPeriodEnd: toDate(stripeSubscription.items.data[0]?.current_period_end),
            },
          })

          // Upsert the Ad row keyed by subscriptionId.
          const ad = await db.ad.upsert({
            where: { subscriptionId: subscription.id },
            create: {
              subscriptionId: subscription.id,
              status: "Pending",
              weight: pkg.weight,
              name,
              websiteUrl,
            },
            update: {
              name,
              websiteUrl,
              // Resetting to Pending on resubmission of creative.
              status: "Pending",
              approvedAt: null,
              rejectedAt: null,
              rejectionNote: null,
            },
          })

          // Auto-fetch favicon (best-effort, non-blocking failure). Stored on the
          // workspace's S3 prefix and surfaced via Meta — publishers can render it
          // however they want when serving the ad.
          await fetchAndUploadFavicon(s3, {
            websiteUrl,
            key: `workspaces/${workspaceId}/ads/${ad.id}/favicon.png`,
          }).catch(() => null)

          // Replace meta rows for this ad to mirror the submitted custom-field values.
          if (meta.length > 0) {
            const validFieldIds = new Set(
              (await db.field.findMany({ where: { workspaceId }, select: { id: true } })).map(
                f => f.id,
              ),
            )
            const filtered = meta.filter(m => validFieldIds.has(m.fieldId))

            await db.meta.deleteMany({ where: { adId: ad.id } })
            if (filtered.length > 0) {
              await db.meta.createMany({
                data: filtered.map(m => ({
                  adId: ad.id,
                  fieldId: m.fieldId,
                  value: m.value,
                })),
              })
            }
          }

          // Notify workspace owners and managers.
          const reviewers = await db.workspaceMember.findMany({
            where: {
              workspaceId,
              role: { in: [WorkspaceMemberRole.Owner, WorkspaceMemberRole.Manager] },
            },
            include: { user: { select: { email: true, name: true } } },
          })

          const workspace = await db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true },
          })

          if (workspace && reviewers.length > 0) {
            const { html, text } = await renderAdPendingReview({
              workspaceName: workspace.name,
              advertiserName: advertiser.name,
              advertiserEmail: customerEmail,
              packageName: pkg.name,
              reviewUrl: `${env.APP_URL}/${workspace.id}/ads/${ad.id}`,
            })

            await Promise.all(
              reviewers
                .filter(r => r.user.email)
                .map(r =>
                  emails.send({
                    to: { email: r.user.email!, name: r.user.name },
                    subject: `New ad pending review on ${workspace.name}`,
                    html,
                    text,
                  }),
                ),
            )
          }

          return { adId: ad.id, subscriptionId: subscription.id }
        },
      ),
  }),
})
