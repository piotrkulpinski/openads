import { db } from "@openads/db"
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { env } from "~/env"
import { stripe } from "../../lib/stripe"

const webhookSecret = env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new NextResponse("No signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      // Handle Connect account updates
      case "account.updated": {
        const account = event.data.object as Stripe.Account
        await handleConnectAccountUpdate(account)
        break
      }

      // Handle successful payments
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      // Handle failed payments
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(paymentIntent)
        break
      }

      // Handle transfers to connected accounts
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer
        await handleTransferCreated(transfer)
        break
      }
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return new NextResponse("Webhook handler failed", { status: 500 })
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

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const booking = await db.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (!booking) return

  // Calculate fees
  const stripeFee = Math.round(paymentIntent.application_fee_amount || 0)
  const platformFee = Math.round((booking.amount * 10) / 100) // 10% platform fee

  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "paid",
      stripeFee,
      platformFee,
    },
  })
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const booking = await db.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (!booking) return

  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "failed",
    },
  })
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  // Find booking by payment intent ID from metadata
  const booking = await db.booking.findFirst({
    where: { stripePaymentIntentId: transfer.metadata?.payment_intent },
  })

  if (!booking) return

  await db.booking.update({
    where: { id: booking.id },
    data: { stripeTransferId: transfer.id },
  })
}
