import type { InferRouterInputs, InferRouterOutputs, RouterClient } from "@orpc/server"
import { adRouter, getCurrentAds, recordClick, recordImpression } from "./routers/ad"
import { advertiserRouter } from "./routers/advertiser"
import { authRouter } from "./routers/auth"
import { dashboardRouter } from "./routers/dashboard"
import { fieldRouter } from "./routers/field"
import { onboardingRouter } from "./routers/onboarding"
import { storageRouter } from "./routers/storage"
import { stripeRouter } from "./routers/stripe"
import { tierRouter } from "./routers/tier"
import { tierPriceRouter } from "./routers/tier-price"
import { userRouter } from "./routers/user"
import { workspaceRouter } from "./routers/workspace"

/**
 * Internal RPC router consumed by `apps/app` via `@orpc/client`. Mounted at
 * `/rpc/*` on the API. Includes every workspace-scoped procedure plus the
 * unauthenticated procedures that the dashboard needs (checkout success page,
 * embed page).
 */
export const appRouter = {
  auth: authRouter,
  stripe: stripeRouter,
  storage: storageRouter,
  user: userRouter,
  onboarding: onboardingRouter,
  workspace: workspaceRouter,
  dashboard: dashboardRouter,
  field: fieldRouter,
  tier: tierRouter,
  tierPrice: tierPriceRouter,
  ad: adRouter,
  advertiser: advertiserRouter,
}

/**
 * REST + OpenAPI router consumed by `@openads/sdk`. Mounted at `/v1/*` on the
 * API. Each procedure carries a `.route({ method, path })` annotation so the
 * OpenAPI handler exposes it at a real REST path and the OpenAPI generator can
 * derive a proper spec.
 */
export const publicRouter = {
  ads: {
    current: getCurrentAds,
    impression: recordImpression,
    click: recordClick,
  },
}

export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<AppRouter>

export type PublicRouter = typeof publicRouter
export type PublicRouterClient = RouterClient<PublicRouter>

/**
 * Inference helpers for input types.
 * @example type HelloInput = RouterInputs['workspace']['create']
 */
export type RouterInputs = InferRouterInputs<AppRouter>

/**
 * Inference helpers for output types.
 * @example type HelloOutput = RouterOutputs['workspace']['create']
 */
export type RouterOutputs = InferRouterOutputs<AppRouter>
