# @openads/logger

Unified logging for the OpenAds monorepo. One interface, two implementations:

| Entry point | Runtime | Backend |
|---|---|---|
| `@openads/logger/server` | Node / Bun | [pino](https://getpino.io) writing to stdout + `logs/openads.log` |
| `@openads/logger/browser` | Browser | Batched HTTP shipper that POSTs entries to a remote `/log` endpoint |

Browser entries are shipped to the API, where they land in the same file as
server entries. Tail one file, see everything.

## Server

```ts
import { createServerLogger, installProcessErrorHandlers } from "@openads/logger/server"

export const logger = createServerLogger({
  name: "api",
  destination: "logs/openads.log", // optional, this is the default
})

installProcessErrorHandlers(logger)

logger.info("server started", { port: 3001 })
logger.error("checkout failed", { err, workspaceId })

// Per-request scoping
const reqLogger = logger.child({ requestId, userId })
reqLogger.warn("rate limited")
```

Pretty printing is automatic outside production. In production stdout
emits JSON so `docker logs` / journald keep working.

## Browser

```ts
import { createBrowserLogger, installGlobalErrorHandlers } from "@openads/logger/browser"

export const logger = createBrowserLogger({
  endpoint: `${import.meta.env.VITE_API_URL}/log`,
  service: "app",
  release: import.meta.env.VITE_RELEASE,
})

installGlobalErrorHandlers(logger)
```

Entries are batched and flushed every 3s (configurable). On `pagehide`
the buffer is flushed with `navigator.sendBeacon` so nothing is lost on
navigation.

## Receiving browser entries

Mount the route handler in your Hono app (or any framework) — see
`apps/api/src/routes/log.ts` for the canonical implementation. It
validates payloads with Zod and re-emits each entry through the server
logger, prefixed with `client.<service>` so they sort cleanly in the
file.

## Swapping in Sentry

The interface is intentionally narrow so call sites don't need to
change. To wire Sentry server-side, add `@sentry/pino-transport` to the
multistream array in `src/server.ts`. Browser-side, instantiate Sentry
in the app's entry and update `createBrowserLogger`'s emit to call
`Sentry.captureException` for `error`/`fatal`. Both can coexist with
the file-shipping path.

## Levels

`trace < debug < info < warn < error < fatal`. Defaults:

- Server: `debug` in dev, `info` in production
- Browser: `debug` to console in dev, `warn` to console otherwise;
  `warn` and above are shipped to the remote endpoint
