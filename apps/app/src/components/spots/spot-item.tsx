import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Link } from "@tanstack/react-router"
import { MoreVerticalIcon, Trash2 } from "lucide-react"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { H5 } from "~/components/ui/heading"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type SpotItemProps = ComponentProps<"div"> & {
  spot: RouterOutputs["spot"]["getAll"][number]
}

const SpotItem = ({ spot, className, ...props }: SpotItemProps) => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.spot.delete.useMutation({
    onSuccess: ({ workspaceId }) => {
      // Show a success toast
      toast.success("Spot deleted successfully")

      // Invalidate the bookings cache
      utils.spot.getAll.invalidate({ workspaceId })
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
      <Link to={spot.id} from="/$workspace/spots">
        <H5 className="truncate">{spot.name}</H5>
        <span className="absolute inset-0" />
      </Link>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            prefix={<MoreVerticalIcon />}
            className="relative z-10 -my-1.5 data-[state=open]:bg-accent"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <ConfirmModal
            key={spot.id}
            isPending={isPending}
            onConfirm={() => mutate({ id: spot.id, workspaceId: spot.workspaceId })}
          >
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </ConfirmModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { SpotItem }
