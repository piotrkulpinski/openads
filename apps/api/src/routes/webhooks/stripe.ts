import { db } from "@openads/db"
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
      // Connect account onboarding status updates
      case "account.updated": {
        const account = event.data.object as Stripe.Account
        await handleConnectAccountUpdate(account)
        break
      }
      // Subscription lifecycle events are wired in M3 alongside the advertiser checkout flow.
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
