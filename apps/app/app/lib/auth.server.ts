import { prisma } from "@openads/db"
import { WorkspaceUserRole } from "@openads/db/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { customSession } from "better-auth/plugins"
import { siteConfig } from "~/config/site"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: import.meta.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: import.meta.env.AUTH_GOOGLE_SECRET ?? "",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    cookiePrefix: siteConfig.name.toLowerCase(),
  },

  plugins: [
    customSession(async ({ user, session }) => {
      const workspaces = await prisma.workspace.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
              role: { in: [WorkspaceUserRole.Owner, WorkspaceUserRole.Manager] },
            },
          },
        },
      })

      return {
        workspaces,
        user,
        session,
      }
    }),
  ],
})
