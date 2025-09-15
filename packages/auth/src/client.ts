import { createAuthClient as createBetterAuthClient } from "better-auth/react"

export interface AuthClientConfig {
  baseURL: string
  credentials?: RequestCredentials
}

export function createAuthClient(config: AuthClientConfig) {
  return createBetterAuthClient({
    baseURL: config.baseURL,
    credentials: config.credentials || "include",
  })
}

export type AuthClient = ReturnType<typeof createAuthClient>
