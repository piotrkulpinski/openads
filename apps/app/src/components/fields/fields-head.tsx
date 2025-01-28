import { FieldType } from "@openads/db/client"
import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Loader2Icon, PlusIcon, Rows3Icon, TrashIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { H6 } from "~/components/ui/heading"
import { fieldsConfig } from "~/config/fields"
import { useFields } from "~/contexts/fields-context"

export const FieldsHead = ({ children }: HTMLAttributes<HTMLElement>) => {
  const { spot, isPending, selectedField, onAddField, onRemoveField } = useFields()

  return (
    <div className="flex min-w-0 items-center gap-2 px-4 py-3 md:px-5">
      <H6 className="flex-1 truncate">{spot.name} Fields</H6>

      {isPending && <Loader2Icon className="size-4 text-muted-foreground animate-spin" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" prefix={<PlusIcon />}>
            Add Field
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Choose Field Type
          </DropdownMenuLabel>

          {Object.values(FieldType).map(type => {
            const Icon = fieldsConfig.icons[type] ?? Rows3Icon

            return (
              <DropdownMenuItem key={type} onClick={() => onAddField(type)}>
                {type}
                <Icon className="ml-auto text-muted-foreground" />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedField && (
        <ConfirmModal key={selectedField.id} onConfirm={() => onRemoveField(selectedField)}>
          <Button
            variant="destructive"
            size="sm"
            prefix={<TrashIcon />}
            aria-label="Delete field"
          />
        </ConfirmModal>
      )}

      {children}
    </div>
  )
}
