import { createFileRoute } from "@tanstack/react-router"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

export const Route = createFileRoute("/$workspaceId/embed")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header>
        <HeaderTitle>Embed Code Generator</HeaderTitle>

        <HeaderDescription size="md">
          Coming back in M5 alongside the new ad serving pipeline.
        </HeaderDescription>
      </Header>
    </>
  )
}
