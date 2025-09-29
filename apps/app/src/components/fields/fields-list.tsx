import { FieldsForm } from "~/components/fields/fields-form"
import { Nav } from "~/components/nav"
import { SortableList } from "~/components/sortable-list"
import { useFields } from "~/contexts/fields-context"
import { FieldsEmptyState } from "./fields-empty-state"
import { FieldsListItem } from "./fields-list-item"

export const FieldsList = () => {
  const { fields, selectedField, onReorderFields } = useFields()

  return (
    <div className="min-h-[17.5rem] relative grid grid-cols-1 overflow-y-auto border-t text-sm sm:grid-cols-3">
      {!!fields.length && (
        <>
          <Nav className="p-2 max-sm:border-b sm:border-r">
            <SortableList items={fields} onDragEnd={onReorderFields}>
              {({ item: field }) => <FieldsListItem key={field.id} field={field} />}
            </SortableList>
          </Nav>

          {selectedField ? (
            <FieldsForm
              key={selectedField.id}
              field={selectedField}
              index={fields.findIndex(f => f.id === selectedField.id)}
              className="col-span-2 overflow-y-auto p-4 md:p-6"
            />
          ) : (
            <FieldsEmptyState className="col-span-2">Select a field to edit.</FieldsEmptyState>
          )}
        </>
      )}

      {!fields.length && (
        <FieldsEmptyState>
          Use this view to add, edit and reorder the custom fields of your ad zone.
        </FieldsEmptyState>
      )}
    </div>
  )
}
