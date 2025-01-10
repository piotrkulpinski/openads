import { db } from "@openads/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { env } from "~/env"
import { generateId, prefixes } from "~/lib/ids"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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
    crossSubDomainCookies: {
      enabled: true,
    },

    generateId: ({ model, size }) => {
      if (model in prefixes) {
        return generateId(model as keyof typeof prefixes, size)
      }

      return generateId(undefined, size)
    },
  },

  trustedOrigins: ["http://localhost:5173"],
})
