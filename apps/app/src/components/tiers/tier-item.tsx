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
import { Link } from "@tanstack/react-router"
import { MoreVerticalIcon, Trash2 } from "lucide-react"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { H5 } from "~/components/ui/heading"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type TierItemProps = ComponentProps<"div"> & {
  workspaceId: string
  tier: RouterOutputs["tier"]["getAll"][number]
}

const formatPrice = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

const TierItem = ({ workspaceId, tier, className, ...props }: TierItemProps) => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.tier.delete.useMutation({
    onSuccess: () => {
      toast.success("Tier archived")
      utils.tier.getAll.invalidate({ workspaceId })
    },
    onError: ({ message }) => {
      toast.error(message)
    },
  })

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
        <p className="text-sm text-muted-foreground">
          {formatPrice(tier.priceMonthly, tier.currency)}/mo · weight {tier.weight}
        </p>
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
              <Trash2 />
              Archive
            </DropdownMenuItem>
          </ConfirmModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { TierItem }
