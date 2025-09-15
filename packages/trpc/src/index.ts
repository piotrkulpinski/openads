import type { Session } from "@openads/auth/server"
import type { db } from "@openads/db"
import { Prisma } from "@openads/db/client"
import type { StripeClient } from "@openads/stripe"
import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError, z } from "zod"

/**
 * Context type that the API will provide
 */
export interface Context extends FetchCreateContextFnOptions, Record<string, unknown> {
  auth: Session | null
  db: typeof db
  redis: any // We'll type this properly when we know the Redis client type
  stripe: StripeClient
  env: {
    APP_URL: string
    // Add other env vars as needed
  }
}

/**
 * Create context function type that API must implement
 */
export type CreateContextFn = (ctx: FetchCreateContextFnOptions) => Promise<Context>

const t = initTRPC.context<Context>().create({
  transformer: superjson,

  errorFormatter: ({ shape, error: { cause } }) => {
    let dataError = {
      formErrors: [] as string[],
      fieldErrors: {} as Record<string, string[]>,
    }

    // Zod error
    if (cause instanceof ZodError) {
      const flattened = cause.flatten()
      dataError = Object.assign(dataError, flattened)
    }

    // Prisma error
    if (cause instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint
      if (cause.code === "P2002") {
        if (cause.meta?.target) {
          const name = (cause.meta?.target as string[]).at(-1)

          if (name) {
            dataError.fieldErrors[name] = [
              `This ${name} has been taken. Please choose another one.`,
            ]
          }
        }
      }
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        ...dataError,
      },
    }
  },
})

export const router = t.router

export const publicProcedure = t.procedure

// Procedure that checks if a user is authenticated
export const authProcedure = publicProcedure.use(
  t.middleware(async ({ ctx: { auth }, next }) => {
    if (!auth) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
      ctx: { user: auth.user },
    })
  }),
)

// procedure that checks if a user is a member of a specific workspace
export const workspaceProcedure = authProcedure
  .input(z.object({ workspaceId: z.string() }))
  .use(async ({ ctx: { db, user }, input: { workspaceId }, next }) => {
    const workspace = await db.workspace.findFirst({
      where: { AND: [{ id: workspaceId }, db.workspace.belongsTo(user.id)] },
    })

    if (!workspace) {
      throw new TRPCError({ code: "FORBIDDEN" })
    }

    return next({
      ctx: { workspace },
    })
  })

// procedure that checks if a user has access to a specific spot
export const spotProcedure = authProcedure
  .input(z.object({ spotId: z.string() }))
  .use(async ({ ctx: { db, user }, input: { spotId }, next }) => {
    const spot = await db.spot.findFirst({
      where: { AND: [{ id: spotId }, db.spot.belongsTo(user.id)] },
    })

    if (!spot) {
      throw new TRPCError({ code: "FORBIDDEN" })
    }

    return next({
      ctx: { spot },
    })
  })
