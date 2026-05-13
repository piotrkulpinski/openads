import { createServerLogger, installProcessErrorHandlers } from "@openads/logger/server"
import { env } from "~/env"

export const logger = createServerLogger({
  name: "api",
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: { env: env.NODE_ENV },
})

installProcessErrorHandlers(logger)
