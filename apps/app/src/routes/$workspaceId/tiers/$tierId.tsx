import { Stack } from "@openads/ui/stack"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { TierForm } from "~/components/tiers/tier-form"
import { TierPriceList } from "~/components/tiers/tier-price-list"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/tiers/$tierId")({
  loader: async ({ context: { orpc, queryClient }, params: { workspaceId, tierId } }) => {
    const tier = await queryClient.fetchQuery(
      orpc.tier.getById.queryOptions({ input: { id: tierId, workspaceId } }),
    )

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
    <Stack direction="column" size="lg" className="items-stretch">
      <H3>Edit Tier</H3>

      <TierForm
        workspaceId={workspaceId}
        tier={tier}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />

      <TierPriceList workspaceId={workspaceId} tier={tier} />
    </Stack>
  )
}
