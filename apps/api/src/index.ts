import { trpcServer } from "@hono/trpc-server"
import { appRouter } from "@openads/trpc/router"
import { Hono } from "hono"
import { showRoutes } from "hono/dev"
import { logger } from "hono/logger"
import { createContext } from "~/context"
import { env } from "~/env"
import { corsMiddleware } from "~/middleware/cors"
import { onError } from "~/middleware/on-error"
import { auth } from "~/services/auth"

const app = new Hono({
  strict: false,
})

app.get("/", c => c.text("OpenAds API"))

// Middlewares
app.use("*", logger())
app.use("*", corsMiddleware)

// TRPC
app.use("/trpc/*", trpcServer({ router: appRouter, createContext }))

// Auth
app.on(["POST", "GET"], "/api/auth/**", c => auth.handler(c.req.raw))

// Error Handling
app.onError(onError)

if (env.NODE_ENV === "development") {
  showRoutes(app, { verbose: true, colorize: true })
}

const server = {
  port: env.PORT,
  fetch: app.fetch,
}

export default server
