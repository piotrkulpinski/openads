import { createFileRoute } from "@tanstack/react-router"
import { PackageForm } from "~/components/packages/package-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/packages/new")({
  component: PackagesNewPage,
})

function PackagesNewPage() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <H3>New Package</H3>

      <PackageForm
        workspaceId={workspaceId}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
