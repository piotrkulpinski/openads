import { cors } from "hono/cors"

export const corsMiddleware = cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Set-Cookie"],
  maxAge: 86400,
})
