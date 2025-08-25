import { trpcServer } from "@hono/trpc-server"
import { appRouter } from "@openads/trpc/router"
import { Hono } from "hono"
import { showRoutes } from "hono/dev"
import { logger } from "hono/logger"
import { createContext } from "~/context"
import { env } from "~/env"
import { auth } from "~/lib/auth"
import { corsMiddleware } from "~/middleware/cors"
import { onError } from "~/middleware/on-error"

const app = new Hono()

app.get("/", c => c.text("OpenAds API"))
app.use("*", logger())
app.use("*", corsMiddleware)
app.use("/trpc/*", trpcServer({ router: appRouter, createContext }))
app.on(["POST", "GET"], "/api/auth/**", c => auth.handler(c.req.raw))

app.onError(onError)

if (env.NODE_ENV === "development") {
  showRoutes(app, { verbose: true, colorize: true })
}

const server = {
  port: env.PORT,
  fetch: app.fetch,
}

export default server
