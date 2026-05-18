import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  loader: async ({ context: { orpc, queryClient } }) => {
    const [user, workspaces] = await Promise.all([
      queryClient.fetchQuery(orpc.user.me.queryOptions()),
      queryClient.fetchQuery(orpc.workspace.getAll.queryOptions()),
    ])

    if (user.defaultWorkspace) {
      throw redirect({
        to: "/$workspaceId",
        params: { workspaceId: user.defaultWorkspace.id },
      })
    }

    if (workspaces[0]) {
      throw redirect({
        to: "/$workspaceId",
        params: { workspaceId: workspaces[0].id },
      })
    }

    throw redirect({
      to: "/onboarding",
    })
  },
})
