import type { Field, FieldType } from "@openads/db/client"
import type { FieldSchema } from "@openads/db/schema"
import { createContext, use } from "react"
import type { PropsWithChildren } from "react"
import { useState } from "react"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"

type FieldsContext = {
  spot: NonNullable<RouterOutputs["spot"]["getById"]>
  fields: RouterOutputs["field"]["getAll"]
  isPending: boolean
  selectedField: Field | null
  setSelectedField: (field: Field | null) => void
  onAddField: (type: keyof typeof FieldType) => void
  onRemoveField: (field: Field) => void
  onUpdateField: (field: Partial<FieldSchema>) => void
  onReorderFields: (fields: Field[]) => void
}

const FieldsContext = createContext<FieldsContext>(null!)

type FieldsProviderProps = PropsWithChildren<{
  spot: NonNullable<RouterOutputs["spot"]["getById"]>
}>

export const FieldsProvider = ({ children, spot }: FieldsProviderProps) => {
  const [selectedField, setSelectedField] = useState<Field | null>(null)

  const { data: fields, refetch } = trpc.field.getAll.useQuery(
    { spotId: spot.id },
    { initialData: [] },
  )

  const addFieldMutation = trpc.field.create.useMutation({
    onSuccess: field => {
      refetch()
      setSelectedField(field)
    },
  })

  const updateFieldMutation = trpc.field.update.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteFieldMutation = trpc.field.delete.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedField(null)
    },
  })

  const reorderFieldsMutation = trpc.field.reorder.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  // Add field
  const onAddField = (type: FieldType) => {
    const newField = {
      type,
      name: `${type} Field`,
      order: fields.length,
      spotId: spot.id,
    }

    addFieldMutation.mutate(newField)
  }

  // Update field
  const onUpdateField = (field: Partial<FieldSchema>) => {
    selectedField &&
      updateFieldMutation.mutate({
        ...field,
        id: selectedField.id,
        spotId: spot.id,
      })
  }

  // Remove field
  const onRemoveField = (field: Field) => {
    deleteFieldMutation.mutate({ id: field.id, spotId: spot.id })
  }

  // Reorder fields
  const onReorderFields = (fields: Field[]) => {
    const updatedFields = fields.map(({ id }, index) => ({ id, order: index }))
    reorderFieldsMutation.mutate({ fields: updatedFields, spotId: spot.id })
  }

  const isPending =
    addFieldMutation.isPending ||
    updateFieldMutation.isPending ||
    deleteFieldMutation.isPending ||
    reorderFieldsMutation.isPending

  return (
    <FieldsContext.Provider
      value={{
        spot,
        fields,
        isPending,
        selectedField,
        setSelectedField,
        onAddField,
        onRemoveField,
        onUpdateField,
        onReorderFields,
      }}
    >
      {children}
    </FieldsContext.Provider>
  )
}

export const useFields = () => use(FieldsContext)
