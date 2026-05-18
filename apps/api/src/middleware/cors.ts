import { cors } from "hono/cors"
import { env } from "~/env"

export const corsMiddleware = cors({
  origin: (origin, context) => {
    if (context.req.path.startsWith("/v1/")) {
      return origin || env.APP_URL
    }

    return env.APP_URL
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Set-Cookie", "Content-Length"],
  credentials: true,
  maxAge: 86400,
})
