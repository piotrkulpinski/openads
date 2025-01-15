import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context: { trpcUtils } }) => {
    const [user, workspaces] = await Promise.all([
      trpcUtils.user.me.fetch(),
      trpcUtils.workspace.getAll.fetch(),
    ])

    // const changeDefaultWorkspace = trpc.workspace.changeDefault.useMutation({
    //   onSuccess: () => {
    //     trpcUtils.user.me.invalidate()
    //   },
    // })

    if (!user) {
      return null
    }

    if (user.defaultWorkspace) {
      throw redirect({ to: "/$workspace", params: { workspace: user.defaultWorkspace.slug } })
    }

    if (workspaces[0]) {
      // changeDefaultWorkspace.mutate({ workspaceId: workspaces[0].id })
      throw redirect({ to: "/$workspace", params: { workspace: workspaces[0].slug } })
    }

    throw redirect({ to: "/onboarding" })
  },
})
