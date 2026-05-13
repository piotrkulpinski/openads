import { createMiddleware } from "hono/factory"
import { logger } from "~/services/logger"

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = performance.now()
  await next()
  const duration = Math.round(performance.now() - start)

  const path = c.req.path.replace(/\?.*/, "")
  const status = c.res.status
  const message = `${c.req.method} ${status} ${path} ${duration}ms`

  if (status >= 500) {
    logger.error(message, { method: c.req.method, path, status, duration })
  } else if (status >= 400) {
    logger.warn(message, { method: c.req.method, path, status, duration })
  } else {
    logger.info(message, { method: c.req.method, path, status, duration })
  }
})
