import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  loader: async ({ context: { trpcUtils } }) => {
    const [user, workspaces] = await Promise.all([
      trpcUtils.user.me.fetch(),
      trpcUtils.workspace.getAll.fetch(),
    ])

    if (user.defaultWorkspace) {
      throw redirect({ to: "/$workspace", params: { workspace: user.defaultWorkspace.slug } })
    }

    if (workspaces[0]) {
      throw redirect({ to: "/$workspace", params: { workspace: workspaces[0].slug } })
    }

    throw redirect({ to: "/onboarding" })
  },
})
