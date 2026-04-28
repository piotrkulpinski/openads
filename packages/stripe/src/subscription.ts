import type Stripe from "stripe"

// Mirrors the Prisma SubscriptionStatus enum without depending on the db package.
export type LocalSubscriptionStatus =
  | "Trialing"
  | "Active"
  | "PastDue"
  | "Canceled"
  | "Unpaid"
  | "Incomplete"
  | "IncompleteExpired"
  | "Paused"

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): LocalSubscriptionStatus {
  switch (status) {
    case "active":
      return "Active"
    case "trialing":
      return "Trialing"
    case "past_due":
      return "PastDue"
    case "canceled":
      return "Canceled"
    case "unpaid":
      return "Unpaid"
    case "incomplete":
      return "Incomplete"
    case "incomplete_expired":
      return "IncompleteExpired"
    case "paused":
      return "Paused"
    default:
      return "Incomplete"
  }
}

export interface SubscriptionMetadata {
  workspaceId: string
  packageId: string
  zoneId: string
}

export function readSubscriptionMetadata(
  metadata: Stripe.Metadata | null | undefined,
): SubscriptionMetadata | null {
  if (!metadata) return null
  const { workspaceId, packageId, zoneId } = metadata
  if (!workspaceId || !packageId || !zoneId) return null
  return { workspaceId, packageId, zoneId }
}

export function toDate(timestamp: number | null | undefined): Date | null {
  if (!timestamp) return null
  return new Date(timestamp * 1000)
}
