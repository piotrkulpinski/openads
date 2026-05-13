import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { env } from "~/env"
import { logger } from "~/services/logger"

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err ? err.status : c.newResponse(null).status
  const statusCode = currentStatus !== 200 ? currentStatus : 500

  const envConfig = c.env?.NODE_ENV || env?.NODE_ENV

  logger.error(`unhandled error on ${c.req.method} ${c.req.path}`, {
    err,
    status: statusCode,
    method: c.req.method,
    path: c.req.path,
  })

  return c.json(
    {
      message: err.message,
      stack: envConfig === "production" ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode,
  )
}
