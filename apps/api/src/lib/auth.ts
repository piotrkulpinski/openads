import { createAuthServer } from "@openads/auth/server"
import { env } from "~/env"

export const auth = createAuthServer({
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
  APP_URL: env.APP_URL,
})
