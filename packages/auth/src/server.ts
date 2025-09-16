import { db } from "@openads/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, lastLoginMethod } from "better-auth/plugins"

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
      database: {
        generateId: false,
      },

      crossSubDomainCookies: {
        enabled: true,
      },
    },

    trustedOrigins: [config.APP_URL],
    plugins: [admin(), lastLoginMethod()],
  })
}

export type AuthServer = ReturnType<typeof createAuthServer>
export type Session = AuthServer["$Infer"]["Session"]
