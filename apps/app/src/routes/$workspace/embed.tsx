import { createFileRoute } from "@tanstack/react-router"
import { EmbedCodeGenerator } from "~/components/embed/embed-code-generator"
import { QueryCell } from "~/components/query-cell"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/embed")({
  loader: async ({ context: { trpcUtils, workspace } }) => {
    const zones = await trpcUtils.zone.getAll.fetch({
      workspaceId: workspace.id,
    })

    return { zones }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { workspace } = Route.useRouteContext()
  const zonesQuery = trpc.zone.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Header>
        <HeaderTitle>Embed Code Generator</HeaderTitle>

        <HeaderDescription size="md">
          Customize how your ad zones widget will appear on your website.
        </HeaderDescription>
      </Header>

      <QueryCell
        query={zonesQuery}
        pending={() => <p className="text-sm text-muted-foreground">Loading zones…</p>}
        error={() => <p className="text-red-500">There was an error loading the zones.</p>}
        empty={() => <EmbedCodeGenerator zones={[]} />}
        success={({ data }) => <EmbedCodeGenerator zones={data} />}
      />
    </>
  )
}
