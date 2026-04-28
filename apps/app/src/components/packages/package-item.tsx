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

type PackageItemProps = ComponentProps<"div"> & {
  workspaceId: string
  zoneId: string
  pkg: RouterOutputs["package"]["getAll"][number]
}

const formatPrice = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

const PackageItem = ({ workspaceId, zoneId, pkg, className, ...props }: PackageItemProps) => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.package.delete.useMutation({
    onSuccess: () => {
      toast.success("Package archived")
      utils.package.getAll.invalidate({ zoneId })
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
        to="/$workspaceId/zones/$zoneId/packages/$packageId"
        params={{ workspaceId, zoneId, packageId: pkg.id }}
        className="flex-1"
      >
        <Stack size="sm">
          <H5 className="truncate">{pkg.name}</H5>
          {!pkg.isActive && <Badge variant="secondary">Archived</Badge>}
        </Stack>
        <p className="text-sm text-muted-foreground">
          {formatPrice(pkg.priceMonthly, pkg.currency)}/mo · weight {pkg.weight}
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
            key={pkg.id}
            isPending={isPending}
            onConfirm={() => mutate({ id: pkg.id, zoneId })}
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

export { PackageItem }
