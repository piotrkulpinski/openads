import { db } from "@openads/db"
import { setupAnalytics } from "@openads/events/server"
import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from "next-safe-action"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "~/lib/auth/server"

export const actionClient = createSafeActionClient({
  handleServerError: (e: Error) => {
    if (e instanceof Error) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

export const actionClientWithMeta = createSafeActionClient({
  handleServerError: (e: Error) => {
    if (e instanceof Error) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },

  defineMetadataSchema: () => {
    return z.object({
      name: z.string(),
      track: z.object({ event: z.string(), channel: z.string() }).optional(),
    })
  },
})

export const authActionClient = actionClientWithMeta
  // Database middleware
  .use(async ({ next }) => {
    return next({
      ctx: { db },
    })
  })

  // Logger middleware
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next()

    if (process.env.NODE_ENV === "development") {
      console.log("Input ->", clientInput)
      console.log("Result ->", result.data)
      console.log("Metadata ->", metadata)

      return result
    }

    return result
  })

  // Ratelimit middleware
  // .use(async ({ next, metadata }) => {
  //   const headersList = await headers()
  //   const ip = headersList.get("x-forwarded-for")

  //   const { success, remaining } = await ratelimit.limit(`${ip}-${metadata.name}`)

  //   if (!success) {
  //     throw new Error("Too many requests")
  //   }

  //   return next({
  //     ctx: { ratelimit: { remaining } },
  //   })
  // })

  // Auth middleware
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    return next({
      ctx: { user: session.user },
    })
  })

  // Analytics middleware
  .use(async ({ next, ctx, metadata }) => {
    const analytics = await setupAnalytics({
      userId: ctx.user.id,
      fullName: ctx.user.name,
    })

    if (metadata?.track) {
      analytics.track(metadata.track)
    }

    return next({
      ctx: { analytics },
    })
  })
