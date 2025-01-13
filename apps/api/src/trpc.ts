import { db } from "@openads/db"
import { Prisma } from "@openads/db/client"
import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError, z } from "zod"
import type { typeToFlattenedError } from "zod"
import { auth as betterAuth } from "~/lib/auth"
import { redis } from "~/services/redis"

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (ctx: FetchCreateContextFnOptions) => {
  const auth = await betterAuth.api.getSession({ headers: ctx.req.headers })

  return { ...ctx, auth, db, redis }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,

  errorFormatter: ({ shape, error: { cause } }) => {
    let dataError: typeToFlattenedError<any, string> = {
      formErrors: [],
      fieldErrors: {},
    }

    // Zod error
    if (cause instanceof ZodError) {
      dataError = Object.assign(dataError, cause.flatten())
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

export const procedure = t.procedure

// Procedure that checks if a user is authenticated
export const authProcedure = procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.auth) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
      ctx: {
        ...ctx,
        userId: ctx.auth.user.id,
      },
    })
  }),
)

// procedure that checks if a user is a member of a specific workspace
export const workspaceProcedure = authProcedure
  .input(z.object({ workspaceId: z.string() }))
  .use(async ({ ctx: { db, userId }, input: { workspaceId }, next }) => {
    const workspace = await db.workspace.findFirst({
      where: { AND: [{ id: workspaceId }, db.workspace.belongsTo(userId)] },
    })

    if (!workspace) {
      throw new TRPCError({ code: "FORBIDDEN" })
    }

    return next()
  })
