import { trpcServer } from "@hono/trpc-server"
import { appRouter } from "@openads/trpc/router"
import { Hono } from "hono"
import { showRoutes } from "hono/dev"
import { createContext } from "~/context"
import { env } from "~/env"
import { corsMiddleware } from "~/middleware/cors"
import { onError } from "~/middleware/on-error"
import { logRoute } from "~/routes/log"
import { auth } from "~/services/auth"
import { logger } from "~/services/logger"
import { loggerMiddleware } from "./middleware/logger"

const app = new Hono({
  strict: false,
})

app.get("/", c => c.text("OpenAds API"))

// Middlewares
app.use("*", loggerMiddleware)
app.use("*", corsMiddleware)

// TRPC
app.use("/trpc/*", trpcServer({ router: appRouter, createContext }))

// Auth
app.on(["POST", "GET"], "/api/auth/**", c => auth.handler(c.req.raw))

// Browser log ingestion
app.route("/log", logRoute)

// Error Handling
app.onError(onError)

if (env.NODE_ENV === "development") {
  showRoutes(app, { verbose: true, colorize: true })
}

logger.info("api booted", { port: env.PORT, env: env.NODE_ENV })

const server = {
  port: env.PORT,
  fetch: app.fetch,
}

export default server
