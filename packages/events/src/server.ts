import type { Logger } from "@openads/logger"
import { type IdentifyPayload, OpenPanel, type TrackProperties } from "@openpanel/sdk"
import { env } from "./env"

export type AnalyticsClient = ReturnType<typeof createAnalytics>

export type TrackEvent = { event: string } & TrackProperties

/**
 * Server-side OpenPanel client, instantiated once and shared via the oRPC
 * context (like `db` / `emails` / `s3`). Outside production — or when the
 * OpenPanel credentials are unset — events are logged at debug instead of
 * sent, so local dev and tests never depend on credentials or network.
 *
 * The logger is injected so the package reuses the caller's singleton
 * (`apps/api`) instead of spinning up a second pino instance.
 */
export const createAnalytics = ({ logger }: { logger: Logger }) => {
  const log = logger.child({ service: "analytics" })

  // Analytics are best-effort and must never fail or slow down a mutation, so
  // every network call is fired and forgotten. Failures only land in the logs.
  const runInBackground = (promise: Promise<unknown> | undefined) => {
    promise?.catch(err => log.error("analytics task failed", { err }))
  }

  const { OPENPANEL_CLIENT_ID, OPENPANEL_SECRET_KEY } = env
  const enabled =
    process.env.NODE_ENV === "production" && !!OPENPANEL_CLIENT_ID && !!OPENPANEL_SECRET_KEY

  const client = enabled
    ? new OpenPanel({ clientId: OPENPANEL_CLIENT_ID!, clientSecret: OPENPANEL_SECRET_KEY! })
    : null

  return {
    // Pass `profileId` to attribute the event to the authed user where known.
    track: ({ event, ...properties }: TrackEvent) => {
      if (!client) {
        log.debug("track (analytics disabled)", { event, ...properties })
        return
      }

      runInBackground(client.track(event, properties))
    },

    identify: (payload: IdentifyPayload) => {
      if (!client) {
        log.debug("identify (analytics disabled)", { profileId: payload.profileId })
        return
      }

      runInBackground(client.identify(payload))
    },
  }
}
