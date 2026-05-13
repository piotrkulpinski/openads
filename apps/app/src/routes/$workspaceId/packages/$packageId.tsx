import { createFileRoute, notFound } from "@tanstack/react-router"
import { PackageForm } from "~/components/packages/package-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/packages/$packageId")({
  loader: async ({ context: { trpc }, params: { workspaceId, packageId } }) => {
    const pkg = await trpc.package.getById.fetch({ id: packageId, workspaceId })

    if (!pkg) {
      throw notFound()
    }

    return { pkg }
  },

  component: PackagesEditPage,
})

function PackagesEditPage() {
  const { workspaceId } = Route.useParams()
  const { pkg } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Package</H3>

      <PackageForm
        workspaceId={workspaceId}
        pkg={pkg}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
