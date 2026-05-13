import { type AuthClient, createAuthClient } from "@openads/auth/client"
import { env } from "~/env"

export const authClient: AuthClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/api/auth`,
  credentials: "include",
})
