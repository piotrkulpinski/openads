import { createFileRoute } from "@tanstack/react-router"
import { EmbedSnippet } from "~/components/embed/embed-snippet"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

export const Route = createFileRoute("/$workspaceId/embed")({
  component: EmbedPage,
})

function EmbedPage() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <Header>
        <HeaderTitle>Embed</HeaderTitle>
        <HeaderDescription size="md">
          Drop this snippet onto your site so visitors can subscribe to one of your advertising
          tiers.
        </HeaderDescription>
      </Header>

      <EmbedSnippet workspaceId={workspaceId} />
    </>
  )
}
