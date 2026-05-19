import { appRouter, publicRouter } from "@openads/orpc/router"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins"
import { onError as onORPCError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { SimpleCsrfProtectionHandlerPlugin } from "@orpc/server/plugins"
// Both must come from the `/zod4` entry: the root `@orpc/zod` export is the
// Zod v3 build and its coercion plugin silently no-ops against our v4 schemas,
// which 422s every coerced query param (weightGte/count/excludeIds) on /v1.
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4"
import { Hono } from "hono"
import { showRoutes } from "hono/dev"
import { createContext } from "~/context"
import { env } from "~/env"
import { corsMiddleware } from "~/middleware/cors"
import { onError as honoOnError } from "~/middleware/on-error"
import { logRoute } from "~/routes/log"
import { stripeWebhookRoute } from "~/routes/webhooks/stripe"
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

const rpcHandler = new RPCHandler(appRouter, {
  strictGetMethodPluginEnabled: false,
  plugins: [new SimpleCsrfProtectionHandlerPlugin()],
  interceptors: [
    onORPCError(error => {
      logger.error("orpc rpc handler error", { err: error, surface: "rpc" })
    }),
  ],
})

const restHandler = new OpenAPIHandler(publicRouter, {
  plugins: [
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      docsPath: "/docs",
      specPath: "/openapi.json",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "OpenAds API",
          version: "1.0.0",
          description:
            "Public surface of the OpenAds platform. Consumed by `@openads/sdk` and `@openads/react`.\n\n" +
            "**Errors** are returned as an oRPC envelope: " +
            "`{ defined: boolean, code: string, status: number, message: string, data?: object }`. " +
            'Input-validation failures return HTTP **422** with `code: "INPUT_VALIDATION_FAILED"` ' +
            "and `data.fieldErrors` / `data.formErrors`.",
        },
        servers: [{ url: `${env.API_URL.replace(/\/$/, "")}/v1` }],
      },
    }),
  ],
  interceptors: [
    onORPCError(error => {
      logger.error("orpc openapi handler error", { err: error, surface: "v1" })
    }),
  ],
})

// Internal RPC surface: typed client used by apps/app.
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ headers: c.req.raw.headers })
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

const adsCurrentPath = /^\/v1\/workspaces\/[^/]+\/ads\/current$/

// Public REST + OpenAPI surface (`/v1/openapi.json`, `/v1/docs`, plus the routed
// procedures themselves). Consumed by `@openads/sdk` and any third-party API
// integrators.
app.use("/v1/*", async (c, next) => {
  const context = await createContext({ headers: c.req.raw.headers })
  const { matched, response } = await restHandler.handle(c.req.raw, {
    prefix: "/v1",
    context,
  })

  if (!matched) {
    await next()
    return
  }

  // Cache the public ads-serving endpoint at the edge — short max-age plus a
  // longer stale-while-revalidate window so a brief publisher traffic spike
  // can't hammer the API.
  if (
    c.req.method === "GET" &&
    adsCurrentPath.test(new URL(c.req.url).pathname) &&
    response.status >= 200 &&
    response.status < 300
  ) {
    const headers = new Headers(response.headers)
    headers.set("Cache-Control", "public, max-age=5, s-maxage=15, stale-while-revalidate=60")
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return c.newResponse(response.body, response)
})

// Auth
app.on(["POST", "GET"], "/api/auth/**", c => auth.handler(c.req.raw))

// Browser log ingestion
app.route("/log", logRoute)

// Stripe webhooks
app.route("/webhooks/stripe", stripeWebhookRoute)

// Error Handling
app.onError(honoOnError)

if (env.NODE_ENV === "development") {
  showRoutes(app, { verbose: true, colorize: true })
}

logger.info("api booted", { port: env.PORT, env: env.NODE_ENV })

const server = {
  port: env.PORT,
  fetch: app.fetch,
}

export default server
