import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  loader: async ({ context: { trpc } }) => {
    const [user, workspaces] = await Promise.all([
      trpc.user.me.fetch(),
      trpc.workspace.getAll.fetch(),
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
