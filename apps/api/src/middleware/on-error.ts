import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { env } from "~/env"

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err ? err.status : c.newResponse(null).status
  const statusCode = currentStatus !== 200 ? currentStatus : 500

  const envConfig = c.env?.NODE_ENV || env?.NODE_ENV
  return c.json(
    {
      message: err.message,
      stack: envConfig === "production" ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode,
  )
}
