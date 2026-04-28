import { AdStatus, WorkspaceMemberRole } from "@openads/db/client"
import {
  renderAdApproved,
  renderAdChangesRequested,
  renderAdPendingReview,
  renderAdRejected,
} from "@openads/emails"
import { fetchAndUploadFavicon } from "@openads/s3/favicon"
import { mapStripeSubscriptionStatus, toDate } from "@openads/stripe/subscription"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { adProcedure, publicProcedure, router, workspaceProcedure } from "../index"

const createFromCheckoutInput = z.object({
  sessionId: z.string().min(1),
  name: z.string().trim().min(2),
  websiteUrl: z.url(),
  description: z.string().trim().optional(),
  buttonLabel: z.string().trim().optional(),
  meta: z
    .array(z.object({ fieldId: z.string(), value: z.any() }))
    .optional()
    .default([]),
})

const reviewNoteInput = z.object({ note: z.string().trim().min(1).max(500) })
const optionalNoteInput = z.object({ note: z.string().trim().max(500).optional() })

export const adRouter = router({
  // Workspace dashboard surface.
  getAll: workspaceProcedure
    .input(
      z.object({
        status: z.enum(AdStatus).optional(),
        zoneId: z.string().optional(),
      }),
    )
    .query(async ({ ctx: { db, workspace }, input: { status, zoneId } }) => {
      return await db.ad.findMany({
        where: {
          subscription: {
            workspaceId: workspace.id,
            ...(zoneId ? { package: { zoneId } } : {}),
          },
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: {
              advertiser: true,
              package: { include: { zone: true } },
            },
          },
        },
      })
    }),

  getById: adProcedure.query(({ ctx: { ad } }) => ad),

  approve: adProcedure
    .input(optionalNoteInput)
    .mutation(async ({ ctx: { ad, db, emails, workspace } }) => {
      const updated = await db.ad.update({
        where: { id: ad.id },
        data: {
          status: AdStatus.Approved,
          approvedAt: new Date(),
          rejectedAt: null,
          rejectionNote: null,
        },
      })

      const advertiserEmail = ad.subscription.advertiser.email
      if (advertiserEmail) {
        const { html, text } = await renderAdApproved({
          workspaceName: workspace.name,
          adName: ad.name,
          zoneName: ad.subscription.package.zone.name,
        })

        await emails.send({
          to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
          subject: `Your ad on ${workspace.name} is now live`,
          html,
          text,
        })
      }

      return updated
    }),

  reject: adProcedure
    .input(reviewNoteInput)
    .mutation(async ({ ctx: { ad, db, emails, stripe, workspace }, input: { note } }) => {
      const updated = await db.ad.update({
        where: { id: ad.id },
        data: {
          status: AdStatus.Rejected,
          rejectedAt: new Date(),
          approvedAt: null,
          rejectionNote: note,
        },
      })

      // Cancel the underlying Stripe subscription so the advertiser stops being billed.
      try {
        await stripe.subscriptions.cancel(ad.subscription.stripeSubscriptionId)
      } catch (err) {
        console.warn(
          `[ad.reject] failed to cancel stripe subscription ${ad.subscription.stripeSubscriptionId}:`,
          err,
        )
      }

      const advertiserEmail = ad.subscription.advertiser.email
      if (advertiserEmail) {
        const { html, text } = await renderAdRejected({
          workspaceName: workspace.name,
          adName: ad.name,
          zoneName: ad.subscription.package.zone.name,
          rejectionNote: note,
        })

        await emails.send({
          to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
          subject: `Your ad on ${workspace.name} was not approved`,
          html,
          text,
        })
      }

      return updated
    }),

  requestChanges: adProcedure
    .input(reviewNoteInput)
    .mutation(async ({ ctx: { ad, db, emails, env, workspace }, input: { note } }) => {
      const updated = await db.ad.update({
        where: { id: ad.id },
        data: {
          status: AdStatus.Pending,
          approvedAt: null,
          rejectedAt: null,
          rejectionNote: note,
        },
      })

      const advertiserEmail = ad.subscription.advertiser.email
      if (advertiserEmail) {
        const { html, text } = await renderAdChangesRequested({
          workspaceName: workspace.name,
          adName: ad.name,
          zoneName: ad.subscription.package.zone.name,
          changesNote: note,
          // sessionId isn't tracked on the Ad row — point advertisers at the billing portal
          // for now. v2 can store a session token to support direct creative resubmission.
          resubmitUrl: `${env.APP_URL}/advertise/cancelled`,
        })

        await emails.send({
          to: { email: advertiserEmail, name: ad.subscription.advertiser.name },
          subject: `Changes requested on your ad`,
          html,
          text,
        })
      }

      return updated
    }),

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
        const zoneId = metadata?.zoneId

        if (!workspaceId || !packageId || !zoneId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Missing checkout metadata." })
        }

        const [workspace, zone, pkg, fields, existingAd] = await Promise.all([
          db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, slug: true, faviconUrl: true },
          }),
          db.zone.findUnique({
            where: { id: zoneId },
            select: { id: true, name: true, description: true },
          }),
          db.package.findUnique({
            where: { id: packageId },
            select: { id: true, name: true, weight: true, priceMonthly: true, currency: true },
          }),
          db.field.findMany({
            where: { zoneId },
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

        if (!workspace || !zone || !pkg) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }

        return {
          workspace,
          zone,
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
          input: { sessionId, name, websiteUrl, description, buttonLabel, meta },
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
          const zoneId = metadata?.zoneId
          const customerEmail = session.customer_email

          if (!workspaceId || !packageId || !zoneId || !customerEmail) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Missing checkout metadata." })
          }

          const pkg = await db.package.findUnique({
            where: { id: packageId },
            select: {
              id: true,
              name: true,
              weight: true,
              zoneId: true,
              zone: { select: { id: true, name: true, workspaceId: true } },
            },
          })

          if (!pkg || pkg.zone.workspaceId !== workspaceId || pkg.zoneId !== zoneId) {
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
              description: description ?? "",
              websiteUrl,
              buttonLabel: buttonLabel ?? "",
            },
            update: {
              name,
              description: description ?? "",
              websiteUrl,
              buttonLabel: buttonLabel ?? "",
              // Resetting to Pending on resubmission of creative.
              status: "Pending",
              approvedAt: null,
              rejectedAt: null,
              rejectionNote: null,
            },
          })

          // Auto-fetch favicon (best-effort, non-blocking failure).
          const faviconUrl = await fetchAndUploadFavicon(s3, {
            websiteUrl,
            key: `workspaces/${workspaceId}/ads/${ad.id}/favicon.png`,
          }).catch(() => null)

          if (faviconUrl) {
            await db.ad.update({ where: { id: ad.id }, data: { faviconUrl } })
          }

          // Replace meta rows for this ad to mirror the submitted custom-field values.
          if (meta.length > 0) {
            const validFieldIds = new Set(
              (await db.field.findMany({ where: { zoneId }, select: { id: true } })).map(f => f.id),
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
            select: { name: true, slug: true },
          })

          if (workspace && reviewers.length > 0) {
            const { html, text } = await renderAdPendingReview({
              workspaceName: workspace.name,
              advertiserName: advertiser.name,
              advertiserEmail: customerEmail,
              zoneName: pkg.zone.name,
              packageName: pkg.name,
              reviewUrl: `${env.APP_URL}/${workspace.slug}/ads/${ad.id}`,
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
