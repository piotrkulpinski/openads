import { createFileRoute } from "@tanstack/react-router"
import { EmbedCodeGenerator } from "~/components/embed/embed-code-generator"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

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
  const { zones } = Route.useLoaderData()

  return (
    <>
      <Header>
        <HeaderTitle>Embed Code Generator</HeaderTitle>

        <HeaderDescription size="md">
          Customize how your ad zones widget will appear on your website.
        </HeaderDescription>
      </Header>

      <EmbedCodeGenerator zones={zones} />
    </>
  )
}
