import { db } from "@openads/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

export interface AuthConfig {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  APP_URL: string
}

export function createAuthServer(config: AuthConfig) {
  return betterAuth({
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),

    socialProviders: {
      google: {
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
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

      generateId: false,
    },

    trustedOrigins: [config.APP_URL],
  })
}

export type AuthServer = ReturnType<typeof createAuthServer>
