import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { ReactNode } from "react"
import { useId } from "react"

export type SortableListProps<T extends { id: UniqueIdentifier }> = {
  items: T[]
  onDragEnd: (items: T[]) => void
  children: ({ item, index }: { item: T; index: number }) => ReactNode
}

export const SortableList = <T extends { id: UniqueIdentifier }>({
  children,
  items,
  onDragEnd,
}: SortableListProps<T>) => {
  const contextId = useId()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)

      onDragEnd(newItems)
    }
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => children?.({ item, index }))}
      </SortableContext>
    </DndContext>
  )
}
