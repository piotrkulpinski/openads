import { type AuthClient, createAuthClientInstance } from "@openads/auth/client"
import { env } from "~/env"

export const authClient: AuthClient = createAuthClientInstance({
  baseURL: `${env.VITE_API_URL}/api/auth`,
  credentials: "include",
})
