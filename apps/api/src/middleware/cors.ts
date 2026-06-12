import type { MiddlewareHandler } from "hono"
import { cors } from "hono/cors"
import { env } from "~/env"

// Public REST surface: static `*`, no credentials — these endpoints take no
// cookies, and a static ACAO keeps the /v1 edge cache shared (a reflected
// origin would force Vary: Origin, fragmenting or poisoning cached
// ads/current responses).
const v1Cors = cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  maxAge: 86400,
})

// Internal surface (/rpc, /api/auth): locked to the app origin, with cookie
// credentials for the session.
const appCors = cors({
  origin: env.APP_URL,
  allowHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Set-Cookie", "Content-Length"],
  credentials: true,
  maxAge: 86400,
})

export const corsMiddleware: MiddlewareHandler = (c, next) =>
  c.req.path.startsWith("/v1/") ? v1Cors(c, next) : appCors(c, next)
