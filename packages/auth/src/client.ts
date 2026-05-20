import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

export interface AuthClientConfig {
  baseURL: string
  credentials?: RequestCredentials
}

// The factory is split in two on purpose: the inner builder's return type is
// inferred from better-auth internals and can't be named across package
// boundaries (TS2742) under `check-types`. We capture it once as `AuthClient`,
// then re-export a public factory with that explicit return type annotation.
// Don't collapse these back into a single exported function — it reintroduces
// the portability error. See packages/auth/src/server.ts for the mirror.
const createConfiguredAuthClient = (config: AuthClientConfig) => {
  return createBetterAuthClient({
    baseURL: config.baseURL,
    credentials: config.credentials ?? "include",
    plugins: [adminClient(), lastLoginMethodClient()],
  })
}

export type AuthClient = ReturnType<typeof createConfiguredAuthClient>

export const createAuthClient = (config: AuthClientConfig): AuthClient => {
  return createConfiguredAuthClient(config)
}
