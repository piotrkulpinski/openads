import { randomUUID } from "node:crypto"
import { Prisma, StripeConnectStatus } from "@openads/db/client"
import { SERVING_SUBSCRIPTION_STATUSES } from "@openads/db/lib/subscription"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, type Context, findMemberWorkspace, workspaceMw } from "../index"

const STRIPE_OAUTH_STATE_TTL_SECONDS = 60 * 10

const stripeOAuthCallbackPath = "/stripe/callback"

const getStripeConnectClientId = (clientId: string | undefined) => {
  if (!clientId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Stripe Connect OAuth is not configured.",
    })
  }

  return clientId
}

const getOAuthStateKey = (state: string) => {
  return `stripe-oauth-state:${state}`
}

const hasDirectStripeData = (data: Prisma.JsonValue | null) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false

  return (data as Record<string, unknown>).integrationMode === "direct"
}

const resetWorkspaceStripeObjects = async (db: Context["db"], workspaceId: string) => {
  await db.$transaction([
    db.tier.updateMany({
      where: { workspaceId },
      data: { stripeProductId: null },
    }),
    db.tierPrice.updateMany({
      where: { tier: { workspaceId } },
      data: { stripePriceId: null },
    }),
  ])
}

export const stripeRouter = {
  connect: {
    create: authProcedure
      .input(z.object({ workspaceId: z.string() }))
      .use(workspaceMw)
      .handler(async ({ context: { redis, user, workspace, env } }) => {
        const state = randomUUID()
        await redis.set(
          getOAuthStateKey(state),
          JSON.stringify({ userId: user.id, workspaceId: workspace.id }),
          "EX",
          STRIPE_OAUTH_STATE_TTL_SECONDS,
        )

        const url = new URL("https://connect.stripe.com/oauth/authorize")
        url.searchParams.set("response_type", "code")
        url.searchParams.set("client_id", getStripeConnectClientId(env.STRIPE_CONNECT_CLIENT_ID))
        url.searchParams.set("scope", "read_write")
        url.searchParams.set("state", state)
        url.searchParams.set("redirect_uri", `${env.APP_URL}${stripeOAuthCallbackPath}`)

        return { url: url.toString() }
      }),

    callback: authProcedure
      .input(z.object({ code: z.string().min(1), state: z.string().min(1) }))
      .handler(async ({ context, input: { code, state } }) => {
        const { db, redis, stripe, user } = context
        const stateKey = getOAuthStateKey(state)
        const storedState = await redis.get(stateKey)

        if (!storedState) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Stripe connection expired. Please try again.",
          })
        }

        await redis.del(stateKey)

        const parsedState = JSON.parse(storedState) as { userId: string; workspaceId: string }

        if (parsedState.userId !== user.id) {
          throw new ORPCError("FORBIDDEN")
        }

        const workspace = await findMemberWorkspace(context, parsedState.workspaceId)

        const token = await stripe.oauth.token({
          grant_type: "authorization_code",
          code,
        })

        if (!token.stripe_user_id) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Stripe did not return a connected account.",
          })
        }

        const account = await stripe.accounts.retrieve(token.stripe_user_id)
        const shouldResetStripeObjects =
          workspace.stripeConnectId !== account.id ||
          !hasDirectStripeData(workspace.stripeConnectData)

        if (shouldResetStripeObjects) {
          await resetWorkspaceStripeObjects(db, workspace.id)
        }

        await db.workspace.update({
          where: { id: workspace.id },
          data: {
            stripeConnectId: account.id,
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

        return { workspaceId: workspace.id }
      }),

    delete: authProcedure
      .input(z.object({ workspaceId: z.string() }))
      .use(workspaceMw)
      .handler(async ({ context: { db, env, workspace, stripe } }) => {
        if (!workspace.stripeConnectId) {
          throw new ORPCError("NOT_FOUND")
        }

        const activeSubscriptions = await db.subscription.count({
          where: {
            workspaceId: workspace.id,
            status: { in: SERVING_SUBSCRIPTION_STATUSES },
          },
        })

        if (activeSubscriptions > 0) {
          throw new ORPCError("PRECONDITION_FAILED", {
            message:
              "Cancel or resolve active advertiser subscriptions before disconnecting Stripe.",
          })
        }

        await stripe.oauth.deauthorize({
          client_id: getStripeConnectClientId(env.STRIPE_CONNECT_CLIENT_ID),
          stripe_user_id: workspace.stripeConnectId,
        })

        await resetWorkspaceStripeObjects(db, workspace.id)

        await db.workspace.update({
          where: { id: workspace.id },
          data: {
            stripeConnectId: null,
            stripeConnectStatus: null,
            stripeConnectEnabled: false,
            stripeConnectData: Prisma.JsonNull,
          },
        })

        return { success: true }
      }),
  },
}
