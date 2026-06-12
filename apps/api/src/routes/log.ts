/**
 * Ingestion endpoint for browser-side log entries shipped by
 * `@openads/logger/browser`. Each entry is re-emitted through the
 * server logger so they land in the same file as server entries.
 *
 * Origin is already restricted by the CORS middleware (only `APP_URL`
 * is allowed), so this is effectively a private endpoint.
 */

import { LOG_LEVELS } from "@openads/logger"
import { Hono } from "hono"
import { z } from "zod"
import { logger } from "~/services/logger"

const MAX_ENTRIES = 50
const MAX_MESSAGE_LENGTH = 2000
const MAX_STACK_LENGTH = 8000

const serializedErrorSchema: z.ZodType<{
  name: string
  message: string
  stack?: string
  cause?: unknown
}> = z.object({
  name: z.string().max(200),
  message: z.string().max(MAX_MESSAGE_LENGTH),
  stack: z.string().max(MAX_STACK_LENGTH).optional(),
  cause: z.lazy(() => serializedErrorSchema).optional(),
})

const entrySchema = z.object({
  level: z.enum(LOG_LEVELS),
  message: z.string().max(MAX_MESSAGE_LENGTH),
  time: z.number().int().nonnegative(),
  context: z.record(z.string(), z.unknown()).optional(),
  err: serializedErrorSchema.optional(),
  source: z
    .object({
      url: z.string().max(1000).optional(),
      userAgent: z.string().max(500).optional(),
      service: z.string().max(100).optional(),
      release: z.string().max(100).optional(),
    })
    .optional(),
})

const payloadSchema = z.object({
  entries: z.array(entrySchema).min(1).max(MAX_ENTRIES),
})

export const logRoute = new Hono()

logRoute.post("/", async c => {
  const json = await c.req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(json)

  if (!parsed.success) {
    return c.json({ error: "invalid payload" }, 400)
  }

  for (const entry of parsed.data.entries) {
    const service = entry.source?.service ?? "browser"
    const child = logger.child({
      source: "client",
      clientService: service,
      clientUrl: entry.source?.url,
      clientUserAgent: entry.source?.userAgent,
      clientRelease: entry.source?.release,
      clientTime: new Date(entry.time).toISOString(),
      ...entry.context,
    })

    child[entry.level](`[client.${service}] ${entry.message}`, {
      err: entry.err,
    })
  }

  return c.body(null, 204)
})
