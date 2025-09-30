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

type ZoneItemProps = ComponentProps<"div"> & {
  zone: RouterOutputs["zone"]["getAll"][number]
}

const ZoneItem = ({ zone, className, ...props }: ZoneItemProps) => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.zone.delete.useMutation({
    onSuccess: ({ workspaceId }) => {
      // Show a success toast
      toast.success("Zone deleted successfully")

      // Invalidate the campaigns cache
      utils.zone.getAll.invalidate({ workspaceId })
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
      <Link to={zone.id} from="/$workspaceId/zones">
        <H5 className="truncate">{zone.name}</H5>
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
            key={zone.id}
            isPending={isPending}
            onConfirm={() => mutate({ id: zone.id, workspaceId: zone.workspaceId })}
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

export { ZoneItem }
