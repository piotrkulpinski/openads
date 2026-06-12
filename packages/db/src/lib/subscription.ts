import { SubscriptionStatus } from "../generated/prisma/browser"

/**
 * Subscription statuses that count as "paid up" for serving and revenue: an ad
 * serves only when its creative is Approved AND its subscription is in one of
 * these states. Deliberately typed as a mutable array — Prisma `in:` filters
 * reject readonly tuples.
 */
export const SERVING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.Active,
  SubscriptionStatus.Trialing,
]

export const isServingSubscription = (status: SubscriptionStatus) =>
  SERVING_SUBSCRIPTION_STATUSES.includes(status)
