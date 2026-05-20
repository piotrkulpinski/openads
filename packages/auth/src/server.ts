import { db } from "@openads/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, lastLoginMethod } from "better-auth/plugins"

export interface AuthConfig {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  APP_URL: string
}

// Split in two on purpose — see the explanation in packages/auth/src/client.ts.
// The inner builder's inferred return type can't be named across package
// boundaries (TS2742); we capture it as `AuthServer` and re-export a public
// factory with that explicit annotation. Don't collapse back into one function.
const createConfiguredAuthServer = (config: AuthConfig) => {
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

export type AuthServer = ReturnType<typeof createConfiguredAuthServer>

export const createAuthServer = (config: AuthConfig): AuthServer => {
  return createConfiguredAuthServer(config)
}

export type Session = AuthServer["$Infer"]["Session"]
