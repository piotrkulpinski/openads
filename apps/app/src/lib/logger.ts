import { createBrowserLogger, installGlobalErrorHandlers } from "@openads/logger/browser"
import { env } from "~/env"

export const logger = createBrowserLogger({
  endpoint: `${env.VITE_API_URL}/log`,
  service: "app",
  remoteLevel: env.MODE === "production" ? "warn" : "info",
})

installGlobalErrorHandlers(logger)
