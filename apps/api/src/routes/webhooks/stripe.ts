import { db } from "@openads/db"
import { Prisma, StripeConnectStatus } from "@openads/db/client"
import {
  mapStripeSubscriptionStatus,
  readSubscriptionMetadata,
  toDate,
} from "@openads/stripe/subscription"
import { Hono } from "hono"
import type Stripe from "stripe"
import { env } from "~/env"
import { logger } from "~/services/logger"
import { stripe } from "~/services/stripe"

export const stripeWebhookRoute = new Hono()

// Must be the async variant: under the Bun runtime the Stripe SDK uses the
// SubtleCrypto provider, whose HMAC is async-only — the synchronous
// `constructEvent` throws "cannot be used in a synchronous context", which
// would 400 every real webhook and break subscription sync.
const constructStripeEvent = (body: string, signature: string) => {
  return stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_CONNECT_WEBHOOK_SECRET)
}

stripeWebhookRoute.post("/", async c => {
  const body = await c.req.text()
  const signature = c.req.header("stripe-signature")

  if (!signature) {
    return c.text("No signature", 400)
  }

  let event: Stripe.Event

  try {
    event = await constructStripeEvent(body, signature)
  } catch (err) {
    return c.text(`Invalid signature: ${err}`, 400)
  }

  try {
    switch (event.type) {
      case "account.updated": {
        await handleConnectAccountUpdate(event.data.object, event.account)
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
        await upsertSubscription(event.data.object, event.account)
        break
      }

      case "customer.subscription.deleted": {
        await markSubscriptionCanceled(event.data.object, event.account)
        break
      }
    }

    return c.text("OK", 200)
  } catch (err) {
    logger.error("stripe webhook handler failed", { err, type: event.type })
    return c.text("Webhook handler failed", 500)
  }
})

const handleConnectAccountUpdate = async (account: Stripe.Account, connectedAccountId?: string) => {
  await db.workspace.updateMany({
    where: { stripeConnectId: connectedAccountId ?? account.id },
    data: {
      stripeConnectStatus: account.charges_enabled
        ? StripeConnectStatus.Active
        : StripeConnectStatus.Pending,
      stripeConnectEnabled: account.charges_enabled,
      stripeConnectData: {
        integrationMode: "direct",
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
      },
    },
  })
}

const handleConnectAccountDeauthorized = async (connectedAccountId?: string) => {
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

const upsertSubscription = async (
  stripeSubscription: Stripe.Subscription,
  connectedAccountId?: string,
) => {
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

  const periodItem = stripeSubscription.items.data[0]
  const data = {
    status: mapStripeSubscriptionStatus(stripeSubscription.status),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    currentPeriodStart: toDate(periodItem?.current_period_start),
    currentPeriodEnd: toDate(periodItem?.current_period_end),
  }

  await db.subscription.upsert({
    where: { stripeSubscriptionId: stripeSubscription.id },
    create: {
      ...data,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: customerId,
      workspaceId: meta.workspaceId,
      tierId: meta.tierId,
      tierPriceId: meta.tierPriceId,
      advertiserId: advertiser.id,
    },
    update: data,
  })
}

const markSubscriptionCanceled = async (
  stripeSubscription: Stripe.Subscription,
  connectedAccountId?: string,
) => {
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

const resolveCustomerEmail = async (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
  connectedAccountId: string,
): Promise<string | null> => {
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

const findOrCreateAdvertiser = async ({
  workspaceId,
  email,
}: {
  workspaceId: string
  email: string
}) => {
  return await db.advertiser.upsert({
    where: { workspaceId_email: { workspaceId, email } },
    update: {},
    create: { workspaceId, email, name: email.split("@")[0] ?? email },
  })
}
