import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { router } from "./index"
import { authRouter } from "./routers/auth"
import { bookingRouter } from "./routers/booking"
import { fieldRouter } from "./routers/field"
import { onboardingRouter } from "./routers/onboarding"
import { spotRouter } from "./routers/spot"
import { stripeRouter } from "./routers/stripe"
import { userRouter } from "./routers/user"
import { workspaceRouter } from "./routers/workspace"

export const appRouter = router({
  auth: authRouter,
  stripe: stripeRouter,
  user: userRouter,
  onboarding: onboardingRouter,
  workspace: workspaceRouter,
  spot: spotRouter,
  booking: bookingRouter,
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
