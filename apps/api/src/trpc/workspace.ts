import { Prisma, WorkspaceMemberRole } from "@openads/db/client"
import { workspaceSchema } from "@openads/db/schema"
import { TRPCError } from "@trpc/server"
import { env } from "~/env"
import { stripe } from "~/lib/stripe"
import { authProcedure, router, workspaceProcedure } from "~/trpc"

export const workspaceRouter = router({
  getAll: authProcedure.query(async ({ ctx: { db, user } }) => {
    return await db.workspace.findMany({
      where: db.workspace.belongsTo(user.id),
      orderBy: { createdAt: "asc" },
    })
  }),

  getBySlug: authProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ ctx: { db, user }, input: { slug } }) => {
      return await db.workspace.findFirst({
        where: { AND: [{ slug }, db.workspace.belongsTo(user.id)] },
      })
    }),

  create: authProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db, user }, input: { ...data } }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          members: { create: { userId: user.id, role: WorkspaceMemberRole.Owner } },
        },
      })

      return workspace
    }),

  update: workspaceProcedure
    .input(workspaceSchema)
    .mutation(async ({ ctx: { db }, input: { workspaceId, ...data } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data,
      })

      return workspace
    }),

  delete: workspaceProcedure.mutation(async ({ ctx: { db }, input: { workspaceId } }) => {
    console.log("delete", workspaceId)
    const workspace = await db.workspace.delete({
      where: { id: workspaceId },
    })

    return workspace
  }),

  changeDefault: workspaceProcedure.mutation(
    async ({ ctx: { db, user }, input: { workspaceId } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data: { defaultFor: { connect: { id: user.id } } },
      })

      return workspace
    },
  ),

  createStripeConnect: workspaceProcedure.mutation(async ({ ctx: { db, user, workspace } }) => {
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

  disconnectStripeConnect: workspaceProcedure.mutation(async ({ ctx: { db, workspace } }) => {
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
})
