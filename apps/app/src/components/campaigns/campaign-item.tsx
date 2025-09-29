import { Badge } from "@openads/ui/badge"
import { cx } from "@openads/ui/cva"
import { formatDateRange } from "@primoui/utils"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import type { RouterOutputs } from "~/lib/trpc"

type CampaignItemProps = ComponentProps<typeof Link> & {
  campaign: RouterOutputs["campaign"]["getAll"][number]
}

export function CampaignItem({ campaign, className, ...props }: CampaignItemProps) {
  const statusColor = {
    pending: "bg-blue-50 dark:bg-blue-950",
    paid: "bg-green-50 dark:bg-green-950",
    cancelled: "bg-red-50 dark:bg-red-950",
    refunded: "bg-orange-50 dark:bg-orange-950",
  }[campaign.status]

  return (
    <Link
      to={campaign.id}
      from="/$workspace/campaigns"
      className={cx("flex items-center justify-between px-4 py-3 hover:bg-muted/50", className)}
      {...props}
    >
      <div className="space-y-1">
        <p className="font-medium">{campaign.zone.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(campaign.startsAt, campaign.endsAt)}
        </p>
      </div>

      <div className="text-right">
        <p className="font-medium">${campaign.amount / 100}</p>

        <Badge size="sm" variant="soft" className={cx("capitalize", statusColor)}>
          {campaign.status}
        </Badge>
      </div>
    </Link>
  )
}
