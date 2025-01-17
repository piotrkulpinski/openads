import { cors } from "hono/cors"
import { env } from "~/env"

export const corsMiddleware = cors({
  origin: [env.APP_URL],
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Set-Cookie"],
  maxAge: 86400,
})
