import { createFileRoute, notFound } from "@tanstack/react-router"
import { FieldForm } from "~/components/fields/field-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/fields/$fieldId")({
  loader: async ({ context: { trpc }, params: { workspaceId, fieldId } }) => {
    const field = await trpc.field.getById.fetch({ id: fieldId, workspaceId })

    if (!field) {
      throw notFound()
    }

    return { field }
  },

  component: FieldsEditPage,
})

function FieldsEditPage() {
  const { workspaceId } = Route.useParams()
  const { field } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Field</H3>

      <FieldForm
        workspaceId={workspaceId}
        field={field}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
