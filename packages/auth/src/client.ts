import { createAuthClient } from "better-auth/react"

export interface AuthClientConfig {
  baseURL: string
  credentials?: RequestCredentials
}

export function createAuthClientInstance(config: AuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
    credentials: config.credentials || "include",
  })
}

export type AuthClient = ReturnType<typeof createAuthClientInstance>
