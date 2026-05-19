import type { Session } from "@openads/auth/server"
import { Prisma, type db } from "@openads/db"
import type { EmailClient } from "@openads/emails"
import type { Logger } from "@openads/logger"
import type { RedisClient } from "@openads/redis"
import type { S3BucketClient } from "@openads/s3"
import type { StripeClient } from "@openads/stripe"
import { ORPCError, os, ValidationError } from "@orpc/server"
import { z } from "zod"

type AuthUser = NonNullable<Session>["user"]

/**
 * Context type provided to every procedure. The API layer fills this in via
 * `apps/api/src/context.ts` for both the RPC and OpenAPI handlers.
 */
export interface Context {
  auth: Session | null
  clientIp: string | null
  db: typeof db
  emails: EmailClient
  logger: Logger
  redis: RedisClient
  stripe: StripeClient
  s3: S3BucketClient
  env: {
    APP_URL: string
    API_URL: string
    STRIPE_CONNECT_CLIENT_ID?: string
    STRIPE_PLATFORM_FEE_PERCENT: number
  }
}

const inputValidationErrorData = z.object({
  formErrors: z.array(z.string()),
  fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
})

/**
 * Base builder. `.errors({...})` definitions are mirrored on the client via
 * the router type, so call sites get typed access to `error.data.fieldErrors`.
 */
const o = os.$context<Context>().errors({
  INPUT_VALIDATION_FAILED: {
    status: 422,
    data: inputValidationErrorData,
  },
  // Mirrors the tRPC convention of returning a fieldErrors map for unique
  // constraint violations so existing form-error rendering keeps working.
  CONFLICT_FIELD: {
    status: 409,
    data: inputValidationErrorData,
  },
})

/**
 * Converts Zod validation failures and Prisma P2002 unique-constraint hits into
 * the typed errors above, preserving the `data.fieldErrors` / `data.formErrors`
 * payload `apps/app` consumes via `useMutationErrorHandler`.
 */
export const publicProcedure = o.use(async ({ next, errors }) => {
  try {
    return await next()
  } catch (cause) {
    if (
      cause instanceof ORPCError &&
      cause.code === "BAD_REQUEST" &&
      cause.cause instanceof ValidationError
    ) {
      const zodError = new z.ZodError(cause.cause.issues as z.core.$ZodIssue[])
      throw errors.INPUT_VALIDATION_FAILED({
        message: z.prettifyError(zodError),
        data: z.flattenError(zodError),
        cause: cause.cause,
      })
    }

    if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") {
      const target = cause.meta?.target as string[] | undefined
      const name = target?.at(-1)
      if (name) {
        throw errors.CONFLICT_FIELD({
          message: `This ${name} has been taken. Please choose another one.`,
          data: {
            formErrors: [],
            fieldErrors: {
              [name]: [`This ${name} has been taken. Please choose another one.`],
            },
          },
          cause,
        })
      }
    }

    throw cause
  }
})

export const authProcedure = publicProcedure.use(({ context, next }) => {
  if (!context.auth) {
    throw new ORPCError("UNAUTHORIZED")
  }
  return next({ context: { user: context.auth.user } })
})

/**
 * Standalone middleware that resolves `workspaceId` from the procedure's input,
 * verifies the user is a member, and stamps `workspace` onto the context.
 *
 * oRPC procedure builders only allow ONE `.input()` call per procedure, so each
 * workspace-scoped procedure must declare `workspaceId` in its own input schema
 * and apply this middleware via `.use(workspaceMw)`.
 *
 * Declared dependent context (`user`) means this can only be `.use()`-d on
 * builders that have already run `authProcedure`'s middleware.
 */
export const workspaceMw = os
  .$context<Context & { user: AuthUser }>()
  .middleware(async ({ context, next }, input: { workspaceId: string }) => {
    const workspace = await context.db.workspace.findFirst({
      where: {
        AND: [{ id: input.workspaceId }, context.db.workspace.belongsTo(context.user.id)],
      },
    })

    if (!workspace) {
      throw new ORPCError("FORBIDDEN")
    }

    return next({ context: { workspace } })
  })

type Workspace = NonNullable<Awaited<ReturnType<typeof db.workspace.findFirst>>>

/**
 * Layered on top of `workspaceMw`: assumes `workspace` is in context, refuses
 * the call if Stripe Connect isn't onboarded. Tightens `stripeConnectId` to
 * `string` so call sites can pass it directly to Stripe calls.
 */
export const connectEnabledMw = os
  .$context<Context & { workspace: Workspace }>()
  .middleware(({ context, next }) => {
    const { workspace } = context

    if (!workspace.stripeConnectEnabled || !workspace.stripeConnectId) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Connect your Stripe account before creating tiers.",
      })
    }

    return next({
      context: {
        workspace: { ...workspace, stripeConnectId: workspace.stripeConnectId },
      },
    })
  })

/**
 * Resolves an `Ad` scoped to the current workspace. Requires both `workspaceId`
 * and `adId` on the procedure's input. Performs the workspace membership check
 * itself (so it can be used in place of `workspaceMw` for ad routes).
 */
export const adMw = os
  .$context<Context & { user: AuthUser }>()
  .middleware(async ({ context, next }, input: { workspaceId: string; adId: string }) => {
    const workspace = await context.db.workspace.findFirst({
      where: {
        AND: [{ id: input.workspaceId }, context.db.workspace.belongsTo(context.user.id)],
      },
    })

    if (!workspace) {
      throw new ORPCError("FORBIDDEN")
    }

    const ad = await context.db.ad.findFirst({
      where: { id: input.adId, subscription: { workspaceId: workspace.id } },
      include: {
        subscription: {
          include: {
            advertiser: true,
            tier: true,
            tierPrice: true,
          },
        },
        meta: true,
      },
    })

    if (!ad) {
      throw new ORPCError("NOT_FOUND")
    }

    return next({ context: { workspace, ad } })
  })
