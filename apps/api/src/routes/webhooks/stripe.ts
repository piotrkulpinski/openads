import { db } from "@openads/db"
import type Stripe from "stripe"
import { env } from "~/env"
import { logger } from "~/services/logger"
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
      // Stripe Connect account state changes — flip stripeConnectEnabled when charges go live.
      case "account.updated": {
        await handleConnectAccountUpdate(event.data.object as Stripe.Account)
        break
      }

      // Subscription lifecycle events are scaffolded here; handlers land in D3.
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        break
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    logger.error("stripe webhook handler failed", { err, type: event.type })
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
