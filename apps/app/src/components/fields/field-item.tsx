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

type FieldItemProps = ComponentProps<"div"> & {
  workspaceId: string
  field: RouterOutputs["field"]["getAll"][number]
}

export const FieldItem = ({ workspaceId, field, className, ...props }: FieldItemProps) => {
  const utils = trpc.useUtils()

  const { mutate, isPending } = trpc.field.delete.useMutation({
    onSuccess: () => {
      toast.success("Field deleted")
      utils.field.getAll.invalidate({ workspaceId })
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
        to="/$workspaceId/fields/$fieldId"
        params={{ workspaceId, fieldId: field.id }}
        className="flex-1"
      >
        <Stack size="sm">
          <H5 className="truncate">{field.name}</H5>
          <Badge variant="secondary">{field.type}</Badge>
          {field.isRequired && <Badge>Required</Badge>}
        </Stack>
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
            key={field.id}
            isPending={isPending}
            onConfirm={() => mutate({ id: field.id, workspaceId })}
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
