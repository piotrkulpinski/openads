import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { router } from "./index"
import { authRouter } from "./routers/auth"
import { campaignRouter } from "./routers/campaign"
import { fieldRouter } from "./routers/field"
import { onboardingRouter } from "./routers/onboarding"
import { storageRouter } from "./routers/storage"
import { stripeRouter } from "./routers/stripe"
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
  campaign: campaignRouter,
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
