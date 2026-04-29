import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { router } from "./index"
import { adRouter } from "./routers/ad"
import { authRouter } from "./routers/auth"
import { fieldRouter } from "./routers/field"
import { onboardingRouter } from "./routers/onboarding"
import { packageRouter } from "./routers/package"
import { storageRouter } from "./routers/storage"
import { stripeRouter } from "./routers/stripe"
import { subscriptionRouter } from "./routers/subscription"
import { userRouter } from "./routers/user"
import { workspaceRouter } from "./routers/workspace"
import { zoneRouter } from "./routers/zone"

export const appRouter = router({
  auth: authRouter,
  stripe: stripeRouter,
  storage: storageRouter,
  user: userRouter,
  onboarding: onboardingRouter,
  workspace: workspaceRouter,
  zone: zoneRouter,
  package: packageRouter,
  subscription: subscriptionRouter,
  ad: adRouter,
  field: fieldRouter,
})

export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
