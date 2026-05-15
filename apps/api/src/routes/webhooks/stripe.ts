import { db } from "@openads/db"
import { Prisma } from "@openads/db/client"
import {
  mapStripeSubscriptionStatus,
  readSubscriptionMetadata,
  toDate,
} from "@openads/stripe/subscription"
import { Hono } from "hono"
import type Stripe from "stripe"
import { env } from "~/env"
import { logger } from "~/services/logger"
import { stripe } from "../../services/stripe"

export const stripeWebhookRoute = new Hono()

const constructStripeEvent = (body: string, signature: string) => {
  return stripe.webhooks.constructEvent(body, signature, env.STRIPE_CONNECT_WEBHOOK_SECRET)
}

stripeWebhookRoute.post("/", async c => {
  const body = await c.req.text()
  const signature = c.req.header("stripe-signature")

  if (!signature) {
    return c.text("No signature", 400)
  }

  let event: Stripe.Event

  try {
    event = constructStripeEvent(body, signature)
  } catch (err) {
    return c.text(`Invalid signature: ${err}`, 400)
  }

  try {
    switch (event.type) {
      case "account.updated": {
        await handleConnectAccountUpdate(event.data.object as Stripe.Account, event.account)
        break
      }

      case "account.application.deauthorized": {
        await handleConnectAccountDeauthorized(event.account)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.resumed":
      case "customer.subscription.paused": {
        await upsertSubscription(event.data.object as Stripe.Subscription, event.account)
        break
      }

      case "customer.subscription.deleted": {
        await markSubscriptionCanceled(event.data.object as Stripe.Subscription, event.account)
        break
      }
    }

    return c.text("OK", 200)
  } catch (err) {
    logger.error("stripe webhook handler failed", { err, type: event.type })
    return c.text("Webhook handler failed", 500)
  }
})

async function handleConnectAccountUpdate(account: Stripe.Account, connectedAccountId?: string) {
  const workspace = await db.workspace.findFirst({
    where: { stripeConnectId: connectedAccountId ?? account.id },
  })

  if (!workspace) return

  await db.workspace.update({
    where: { id: workspace.id },
    data: {
      stripeConnectStatus: account.charges_enabled ? "active" : "pending",
      stripeConnectEnabled: account.charges_enabled,
      stripeConnectData: {
        integrationMode: "direct",
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
      },
    },
  })
}

async function handleConnectAccountDeauthorized(connectedAccountId?: string) {
  if (!connectedAccountId) {
    logger.warn("stripe account deauthorized event missing connected account")
    return
  }

  await db.workspace.updateMany({
    where: { stripeConnectId: connectedAccountId },
    data: {
      stripeConnectId: null,
      stripeConnectStatus: null,
      stripeConnectEnabled: false,
      stripeConnectData: Prisma.JsonNull,
    },
  })
}

async function upsertSubscription(
  stripeSubscription: Stripe.Subscription,
  connectedAccountId?: string,
) {
  if (!connectedAccountId) {
    logger.warn("stripe subscription event missing connected account", {
      stripeSubscriptionId: stripeSubscription.id,
    })
    return
  }

  const meta = readSubscriptionMetadata(stripeSubscription.metadata)

  // Without the workspace/tier metadata we can't link the subscription — surface
  // a warning and skip. The AdForm submission path will create the row when it has
  // the data via the checkout session.
  if (!meta) {
    logger.warn("stripe subscription missing metadata — skipping upsert", {
      stripeSubscriptionId: stripeSubscription.id,
    })
    return
  }

  const workspace = await db.workspace.findFirst({
    where: { id: meta.workspaceId, stripeConnectId: connectedAccountId },
    select: { id: true },
  })

  if (!workspace) {
    logger.warn("stripe subscription workspace/account mismatch — skipping upsert", {
      stripeSubscriptionId: stripeSubscription.id,
      workspaceId: meta.workspaceId,
      connectedAccountId,
    })
    return
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id

  const customerEmail = await resolveCustomerEmail(stripeSubscription.customer, connectedAccountId)

  const advertiser = customerEmail
    ? await findOrCreateAdvertiser({ workspaceId: meta.workspaceId, email: customerEmail })
    : null

  if (!advertiser) {
    logger.warn("stripe subscription could not resolve advertiser — skipping", {
      stripeSubscriptionId: stripeSubscription.id,
    })
    return
  }

  await db.subscription.upsert({
    where: { stripeSubscriptionId: stripeSubscription.id },
    create: {
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: customerId,
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodStart: toDate(stripeSubscription.items.data[0]?.current_period_start),
      currentPeriodEnd: toDate(stripeSubscription.items.data[0]?.current_period_end),
      workspaceId: meta.workspaceId,
      tierId: meta.tierId,
      tierPriceId: meta.tierPriceId,
      advertiserId: advertiser.id,
    },
    update: {
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodStart: toDate(stripeSubscription.items.data[0]?.current_period_start),
      currentPeriodEnd: toDate(stripeSubscription.items.data[0]?.current_period_end),
    },
  })
}

async function markSubscriptionCanceled(
  stripeSubscription: Stripe.Subscription,
  connectedAccountId?: string,
) {
  if (!connectedAccountId) {
    logger.warn("stripe subscription deletion event missing connected account", {
      stripeSubscriptionId: stripeSubscription.id,
    })
    return
  }

  await db.subscription.updateMany({
    where: {
      stripeSubscriptionId: stripeSubscription.id,
      workspace: { stripeConnectId: connectedAccountId },
    },
    data: {
      status: "Canceled",
      cancelAtPeriodEnd: false,
    },
  })
}

async function resolveCustomerEmail(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
  connectedAccountId: string,
): Promise<string | null> {
  if (typeof customer === "string") {
    const fetched = await stripe.customers.retrieve(
      customer,
      {},
      { stripeAccount: connectedAccountId },
    )
    if (fetched.deleted) return null
    return fetched.email ?? null
  }
  if (customer.deleted) return null
  return customer.email ?? null
}

async function findOrCreateAdvertiser({
  workspaceId,
  email,
}: {
  workspaceId: string
  email: string
}) {
  const existing = await db.advertiser.findFirst({
    where: { workspaceId, email },
  })

  if (existing) return existing

  return await db.advertiser.create({
    data: { workspaceId, email, name: email.split("@")[0] ?? email },
  })
}
