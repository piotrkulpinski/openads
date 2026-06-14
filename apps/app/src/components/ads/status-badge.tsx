import type { AdStatus, SubscriptionStatus } from "@openads/db/client"
import { Badge } from "@openads/ui/badge"
import type { ComponentProps } from "react"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const adStatusVariant: Record<AdStatus, BadgeVariant> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
}

const subscriptionStatusVariant: Record<SubscriptionStatus, BadgeVariant> = {
  Trialing: "success",
  Active: "success",
  PastDue: "warning",
  Canceled: "secondary",
  Unpaid: "danger",
  Incomplete: "warning",
  IncompleteExpired: "secondary",
  Paused: "secondary",
}

type AdStatusBadgeProps = ComponentProps<typeof Badge> & {
  status: AdStatus
}

export const AdStatusBadge = ({ status, ...props }: AdStatusBadgeProps) => {
  return (
    <Badge variant={adStatusVariant[status]} {...props}>
      {status}
    </Badge>
  )
}

type SubscriptionStatusBadgeProps = ComponentProps<typeof Badge> & {
  status: SubscriptionStatus
}

export const SubscriptionStatusBadge = ({ status, ...props }: SubscriptionStatusBadgeProps) => {
  return (
    <Badge variant={subscriptionStatusVariant[status]} {...props}>
      {status}
    </Badge>
  )
}
