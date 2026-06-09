import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

export type AuthClientConfig = {
  baseURL: string
  credentials?: RequestCredentials
}

// Split factory: better-auth's inferred return type can't be named across
// package boundaries (TS2742). The inner builder infers it once; the public
// export pins it as `AuthClient`. Merging the two breaks consumers' check-types.
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
