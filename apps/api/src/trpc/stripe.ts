import { Prisma } from "@openads/db/client"
import { TRPCError } from "@trpc/server"
import { env } from "~/env"
import { stripe } from "~/lib/stripe"
import { router, workspaceProcedure } from "~/trpc"

export const stripeRouter = router({
  connect: router({
    create: workspaceProcedure.mutation(async ({ ctx: { db, user, workspace } }) => {
      // Create a Stripe Connect account
      const account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
        metadata: { workspaceId: workspace.id },
      })

      // Update workspace with Stripe account ID
      await db.workspace.update({
        where: { id: workspace.id },
        data: {
          stripeConnectId: account.id,
          stripeConnectStatus: "pending",
        },
      })

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${env.APP_URL}/${workspace.slug}/settings/general`,
        return_url: `${env.APP_URL}/${workspace.slug}/settings/general`,
        type: "account_onboarding",
      })

      return { url: accountLink.url }
    }),

    delete: workspaceProcedure.mutation(async ({ ctx: { db, workspace } }) => {
      if (!workspace.stripeConnectId) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      // Disconnect Stripe account
      await stripe.accounts.del(workspace.stripeConnectId)

      // Update workspace
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
  }),
})
