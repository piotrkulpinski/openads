import { createAuthClient } from "better-auth/react"
import { getBaseUrl } from "./trpc"

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
  credentials: "include",
})
