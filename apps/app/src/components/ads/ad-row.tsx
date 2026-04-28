import { Badge } from "@openads/ui/badge"
import { cx } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { H5 } from "~/components/ui/heading"
import type { RouterOutputs } from "~/lib/trpc"

type Ad = RouterOutputs["ad"]["getAll"][number]

const statusVariant: Record<Ad["status"], "secondary" | "success" | "danger"> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "danger",
}

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
          <Badge variant={statusVariant[ad.status]}>{ad.status}</Badge>
        </Stack>
        <p className="text-muted-foreground text-sm">
          {ad.subscription.advertiser.email ?? ad.subscription.advertiser.name} ·{" "}
          {ad.subscription.package.zone.name} · {ad.subscription.package.name}
        </p>
        <span className="absolute inset-0" />
      </Link>
    </div>
  )
}
