import { createFileRoute, notFound } from "@tanstack/react-router"
import { PackageForm } from "~/components/packages/package-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/packages/$packageId")({
  loader: async ({ context: { trpc }, params: { workspaceId, packageId } }) => {
    const adPackage = await trpc.package.getById.fetch({ id: packageId, workspaceId })

    if (!adPackage) {
      throw notFound()
    }

    return { adPackage }
  },

  component: PackagesEditPage,
})

function PackagesEditPage() {
  const { workspaceId } = Route.useParams()
  const { adPackage } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Package</H3>

      <PackageForm
        workspaceId={workspaceId}
        adPackage={adPackage}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
