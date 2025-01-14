import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { router } from "~/trpc"
import { onboardingRouter } from "~/trpc/onboarding"
import { spotRouter } from "~/trpc/spot"
import { userRouter } from "~/trpc/user"
import { workspaceRouter } from "~/trpc/workspace"

export const appRouter = router({
  user: userRouter,
  onboarding: onboardingRouter,
  workspace: workspaceRouter,
  spot: spotRouter,
})

export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
