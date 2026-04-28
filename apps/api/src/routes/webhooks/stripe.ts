import { db } from "@openads/db"
import {
  mapStripeSubscriptionStatus,
  readSubscriptionMetadata,
  toDate,
} from "@openads/stripe/subscription"
import type Stripe from "stripe"
import { env } from "~/env"
import { stripe } from "../../services/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Invalid signature: ${err}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "account.updated": {
        await handleConnectAccountUpdate(event.data.object as Stripe.Account)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.resumed":
      case "customer.subscription.paused": {
        await upsertSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case "customer.subscription.deleted": {
        await markSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
      }

      // Ad approval emails fire from the AdForm submission, not from billing events.
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("Webhook handler failed", { status: 500 })
  }
}

async function handleConnectAccountUpdate(account: Stripe.Account) {
  const workspace = await db.workspace.findFirst({
    where: { stripeConnectId: account.id },
  })

  if (!workspace) return

  await db.workspace.update({
    where: { id: workspace.id },
    data: {
      stripeConnectStatus: account.charges_enabled ? "active" : "pending",
      stripeConnectEnabled: account.charges_enabled,
      stripeConnectData: account as any,
    },
  })
}

async function upsertSubscription(stripeSubscription: Stripe.Subscription) {
  const meta = readSubscriptionMetadata(stripeSubscription.metadata)

  // Without the workspace/package/zone metadata we can't link the subscription
  // — surface a warning and skip. The AdForm submission path will create the row
  // when it has the data via the checkout session.
  if (!meta) {
    console.warn(
      `[stripe] subscription ${stripeSubscription.id} missing metadata — skipping upsert`,
    )
    return
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id

  const customerEmail = await resolveCustomerEmail(stripeSubscription.customer)

  const advertiser = customerEmail
    ? await findOrCreateAdvertiser({ workspaceId: meta.workspaceId, email: customerEmail })
    : null

  // If we cannot resolve an advertiser we still want to record the subscription —
  // attach to a placeholder advertiser so the row exists. In practice the
  // AdForm submission will run before this matters.
  if (!advertiser) {
    console.warn(
      `[stripe] subscription ${stripeSubscription.id} could not resolve advertiser — skipping`,
    )
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
      packageId: meta.packageId,
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

async function markSubscriptionCanceled(stripeSubscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubscription.id },
    data: {
      status: "Canceled",
      cancelAtPeriodEnd: false,
    },
  })
}

async function resolveCustomerEmail(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
): Promise<string | null> {
  if (typeof customer === "string") {
    const fetched = await stripe.customers.retrieve(customer)
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
