import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { env } from "~/env"
import { logger } from "~/services/logger"

export const onError: ErrorHandler = (err, c) => {
  const status = "status" in err && err.status !== 200 ? err.status : 500

  logger.error(`unhandled error on ${c.req.method} ${c.req.path}`, {
    err,
    status,
    method: c.req.method,
    path: c.req.path,
  })

  return c.json(
    {
      message: err.message,
      stack: env.NODE_ENV === "production" ? undefined : err.stack,
    },
    status as ContentfulStatusCode,
  )
}
