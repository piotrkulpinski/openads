import type { AdStatus, SubscriptionStatus } from "@openads/db/client"
import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"

type ServingInput = {
  status: AdStatus
  subscription: { status: SubscriptionStatus }
}

export type ServingState = ReturnType<typeof getServingState>

export const isPaid = (status: SubscriptionStatus) => status === "Active" || status === "Trialing"

/**
 * An ad serves only when the creative is approved AND the subscription is
 * paid up — surface that two-flag rule as a single, glanceable state.
 */
export const getServingState = (ad: ServingInput) => {
  const paid = isPaid(ad.subscription.status)

  if (ad.status === "Approved" && paid) {
    return {
      dot: "bg-green-500",
      ping: true,
      label: "Serving",
      detail: "Creative approved and subscription paid — this ad is in rotation.",
    }
  }
  if (ad.status === "Approved") {
    return {
      dot: "bg-amber-500",
      ping: false,
      label: "Not serving",
      detail: `Creative is approved, but the subscription is ${ad.subscription.status.toLowerCase()}.`,
    }
  }
  if (ad.status === "Rejected") {
    return {
      dot: "bg-red-500",
      ping: false,
      label: "Not serving",
      detail: "Creative was rejected — this ad is out of rotation.",
    }
  }
  return {
    dot: "bg-amber-400",
    ping: false,
    label: "Awaiting review",
    detail: paid
      ? "The subscription is paid. Approve the creative to start serving."
      : `Subscription is ${ad.subscription.status.toLowerCase()} — the ad won't serve even once approved.`,
  }
}

type ServingDotProps = ComponentProps<"span"> & {
  state: ServingState
}

export const ServingDot = ({ state, className, ...props }: ServingDotProps) => {
  return (
    <span className={cx("relative flex size-2", className)} {...props}>
      {state.ping && (
        <span
          className={cx(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60 [animation-duration:2s]",
            state.dot,
          )}
        />
      )}
      <span className={cx("relative inline-flex size-full rounded-full", state.dot)} />
    </span>
  )
}
