import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Stack } from "@openads/ui/stack"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { MoreVerticalIcon, Trash2Icon } from "lucide-react"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { H5 } from "~/components/ui/heading"
import { formatInterval, formatPrice, intervalRank } from "~/lib/currency"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

type Tier = RouterOutputs["tier"]["getAll"][number]

type TierItemProps = ComponentProps<"div"> & {
  workspaceId: string
  tier: Tier
}

// Picks the smallest-interval active price as the headline for the list row.
// `tier.prices` is already filtered to active rows by the tier.getAll query.
const headlinePrice = (prices: Tier["prices"]): Tier["prices"][number] | undefined => {
  if (prices.length === 0) return undefined
  return [...prices].sort((a, b) => {
    const rankDiff = intervalRank(a.interval) - intervalRank(b.interval)
    if (rankDiff !== 0) return rankDiff
    return a.amount - b.amount
  })[0]
}

const renderPriceLine = (tier: Tier): string => {
  const head = headlinePrice(tier.prices)
  if (!head) return `No active prices · weight ${tier.weight}`
  const headLabel = `${formatPrice(head.amount, head.currency)} / ${formatInterval(head)}`
  const extra = tier.prices.length - 1
  return extra > 0
    ? `${headLabel} + ${extra} more · weight ${tier.weight}`
    : `${headLabel} · weight ${tier.weight}`
}

export const TierItem = ({ workspaceId, tier, className, ...props }: TierItemProps) => {
  const { mutate, isPending } = useMutation(
    orpc.tier.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Tier archived")
        queryClient.invalidateQueries({
          queryKey: orpc.tier.getAll.key({ input: { workspaceId } }),
        })
      },
      onError: ({ message }) => {
        toast.error(message)
      },
    }),
  )

  return (
    <div
      className={cx(
        "relative flex items-center justify-between px-4 py-3 hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <Link
        to="/$workspaceId/tiers/$tierId"
        params={{ workspaceId, tierId: tier.id }}
        className="flex-1"
      >
        <Stack size="sm">
          <H5 className="truncate">{tier.name}</H5>
          {!tier.isActive && <Badge variant="secondary">Archived</Badge>}
        </Stack>
        <p className="text-sm text-muted-foreground">{renderPriceLine(tier)}</p>
        <span className="absolute inset-0" />
      </Link>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            prefix={<MoreVerticalIcon />}
            className="-my-1.5 relative z-10 data-[state=open]:bg-accent"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <ConfirmModal
            key={tier.id}
            isPending={isPending}
            onConfirm={() => mutate({ id: tier.id, workspaceId })}
          >
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <Trash2Icon />
              Archive
            </DropdownMenuItem>
          </ConfirmModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
