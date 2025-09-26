import { createMiddleware } from "hono/factory"

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = performance.now()
  await next()
  const end = performance.now() - start
  const duration = Math.round(end)

  // Log only outgoing response details
  console.log(`${c.req.method} ${c.res.status} ${c.req.path.replace(/\?.*/, "")} ${duration}ms`)
})
