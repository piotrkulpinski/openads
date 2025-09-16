import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Field } from "@openads/db/client"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { GripVerticalIcon, Rows3Icon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { fieldsConfig } from "~/config/fields"
import { useFields } from "~/contexts/fields-context"

export type FieldsListItemProps = HTMLAttributes<HTMLElement> & {
  field: Field
}

export const FieldsListItem = ({ field }: FieldsListItemProps) => {
  const { fields, selectedField, setSelectedField } = useFields()

  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  const Icon = fieldsConfig.icons[field.type] ?? Rows3Icon

  const draggableSuffix =
    fields.length < 2 ? null : (
      <GripVerticalIcon
        {...attributes}
        {...listeners}
        className={cx(
          "button-icon cursor-grab !stroke-2 text-xs text-muted-foreground/50 outline-none transition hover:text-muted-foreground",
          "ml-auto",
        )}
        tabIndex={-1}
      />
    )

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="ghost"
      prefix={<Icon />}
      suffix={draggableSuffix}
      className={cx("justify-start", (isDragging || selectedField?.id === field.id) && "bg-accent")}
      onClick={() => setSelectedField(field)}
    >
      {field.name}
    </Button>
  )
}
