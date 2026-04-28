import { createFileRoute } from "@tanstack/react-router"
import { EmbedSnippet } from "~/components/embed/embed-snippet"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

export const Route = createFileRoute("/$workspaceId/embed")({
  loader: async ({ context: { trpc }, params: { workspaceId } }) => {
    const zones = await trpc.zone.getAll.fetch({ workspaceId })
    return { zones }
  },

  component: EmbedPage,
})

function EmbedPage() {
  const { workspaceId } = Route.useParams()
  const { zones } = Route.useLoaderData()

  return (
    <>
      <Header>
        <HeaderTitle>Embed</HeaderTitle>
        <HeaderDescription size="md">
          Drop these snippets onto your site to display ads or sell new packages.
        </HeaderDescription>
      </Header>

      <EmbedSnippet workspaceId={workspaceId} zones={zones} />
    </>
  )
}
