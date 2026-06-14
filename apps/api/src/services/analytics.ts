import { createAnalytics } from "@openads/events/server"
import { logger } from "~/services/logger"

// Single shared OpenPanel server client, handed to every request via the oRPC
// context. Reads its credentials from env; no-ops to debug logs outside prod.
export const analytics = createAnalytics({ logger })
