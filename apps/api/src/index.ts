import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { showRoutes } from "hono/dev"
import { env } from "~/env"
import { auth } from "~/lib/auth"
import { appRouter } from "~/trpc/index"

const app = new Hono()

app.use("*", cors())
app.get("/", c => c.text("OpenAds API"))
app.use("/trpc/*", trpcServer({ router: appRouter }))

app.on(["POST", "GET"], "/auth/**", c => {
  return auth.handler(c.req.raw)
})

if (env.NODE_ENV === "development") {
  showRoutes(app, { verbose: true, colorize: true })
}

const server = {
  port: env.PORT,
  fetch: app.fetch,
}

export default server
