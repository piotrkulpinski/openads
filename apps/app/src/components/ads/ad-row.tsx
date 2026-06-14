import { cx } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { AdStatusBadge } from "~/components/ads/status-badge"
import { H5 } from "~/components/ui/heading"
import type { RouterOutputs } from "~/lib/orpc"

type Ad = RouterOutputs["ad"]["getAll"][number]

type AdRowProps = ComponentProps<"div"> & {
  workspaceId: string
  ad: Ad
}

export const AdRow = ({ workspaceId, ad, className, ...props }: AdRowProps) => {
  return (
    <div
      className={cx(
        "relative flex items-center justify-between px-4 py-3 hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <Link to="/$workspaceId/ads/$adId" params={{ workspaceId, adId: ad.id }} className="flex-1">
        <Stack size="sm">
          <H5 className="truncate">{ad.name}</H5>
          <AdStatusBadge status={ad.status} />
        </Stack>
        <p className="text-muted-foreground text-xs">
          {ad.subscription.advertiser.email ?? ad.subscription.advertiser.name} ·{" "}
          {ad.subscription.tier.name}
        </p>
        <span className="absolute inset-0" />
      </Link>
    </div>
  )
}
