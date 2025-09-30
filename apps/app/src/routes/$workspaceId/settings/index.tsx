import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$workspaceId/settings/")({
  beforeLoad: ({ params: { workspaceId } }) => {
    throw redirect({ to: "/$workspaceId/settings/general", params: { workspaceId } })
  },
})
