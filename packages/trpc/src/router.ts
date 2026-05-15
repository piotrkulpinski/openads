import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { router } from "./index"
import { adRouter } from "./routers/ad"
import { advertiserRouter } from "./routers/advertiser"
import { authRouter } from "./routers/auth"
import { fieldRouter } from "./routers/field"
import { onboardingRouter } from "./routers/onboarding"
import { storageRouter } from "./routers/storage"
import { stripeRouter } from "./routers/stripe"
import { subscriptionRouter } from "./routers/subscription"
import { tierRouter } from "./routers/tier"
import { tierPriceRouter } from "./routers/tier-price"
import { userRouter } from "./routers/user"
import { workspaceRouter } from "./routers/workspace"

export const appRouter = router({
  auth: authRouter,
  stripe: stripeRouter,
  storage: storageRouter,
  user: userRouter,
  onboarding: onboardingRouter,
  workspace: workspaceRouter,
  field: fieldRouter,
  tier: tierRouter,
  tierPrice: tierPriceRouter,
  ad: adRouter,
  advertiser: advertiserRouter,
  subscription: subscriptionRouter,
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
