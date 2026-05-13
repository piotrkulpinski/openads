import { createFileRoute } from "@tanstack/react-router"
import { FieldForm } from "~/components/fields/field-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/fields/new")({
  component: FieldsNewPage,
})

function FieldsNewPage() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <H3>New Field</H3>

      <FieldForm
        workspaceId={workspaceId}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
