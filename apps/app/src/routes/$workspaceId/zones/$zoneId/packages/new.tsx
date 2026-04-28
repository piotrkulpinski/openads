import { createFileRoute } from "@tanstack/react-router"
import { PackageForm } from "~/components/packages/package-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/zones/$zoneId/packages/new")({
  component: PackagesNewPage,
})

function PackagesNewPage() {
  const { zoneId } = Route.useParams()

  return (
    <>
      <H3>New Package</H3>

      <PackageForm zoneId={zoneId} nextUrl={{ from: Route.fullPath, to: ".." }} className="mt-4" />
    </>
  )
}
