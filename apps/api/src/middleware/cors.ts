import { cors } from "hono/cors"
import { env } from "~/env"

export const corsMiddleware = cors({
  origin: env.APP_URL,
  allowHeaders: ["Content-Type", "Authorization", "trpc-accept"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Set-Cookie", "Content-Length"],
  credentials: true,
  maxAge: 86400,
})
