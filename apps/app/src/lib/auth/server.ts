import { db } from "@openads/db"
import { WorkspaceUserRole } from "@openads/db/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { customSession } from "better-auth/plugins"
import { siteConfig } from "~/config/site"
import { env } from "~/env"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
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

  user: {
    additionalFields: {
      defaultWorkspaceId: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },

  advanced: {
    cookiePrefix: siteConfig.name.toLowerCase(),
  },

  plugins: [
    customSession(async ({ user, session }) => {
      const workspace = await db.workspace.findFirst({
        where: {
          defaultFor: {
            some: {
              id: user.id,
            },
          },
          users: {
            some: {
              userId: user.id,
              role: { in: [WorkspaceUserRole.Owner, WorkspaceUserRole.Manager] },
            },
          },
        },
      })

      return {
        workspace,
        user,
        session,
      }
    }),
  ],
})
