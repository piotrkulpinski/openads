import { createAuthClient } from "better-auth/react"
import { env } from "~/env"

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: `${env.VITE_API_URL}/api/auth`,
  credentials: "include",
})
