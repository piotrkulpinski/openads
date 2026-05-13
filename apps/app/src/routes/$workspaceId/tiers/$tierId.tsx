import { createFileRoute, notFound } from "@tanstack/react-router"
import { TierForm } from "~/components/tiers/tier-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/tiers/$tierId")({
  loader: async ({ context: { trpc }, params: { workspaceId, tierId } }) => {
    const tier = await trpc.tier.getById.fetch({ id: tierId, workspaceId })

    if (!tier) {
      throw notFound()
    }

    return { tier }
  },

  component: TiersEditPage,
})

function TiersEditPage() {
  const { workspaceId } = Route.useParams()
  const { tier } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Tier</H3>

      <TierForm
        workspaceId={workspaceId}
        tier={tier}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
