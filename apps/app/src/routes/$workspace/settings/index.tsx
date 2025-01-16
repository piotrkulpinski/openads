import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$workspace/settings/")({
  beforeLoad: ({ params: { workspace } }) => {
    throw redirect({ to: "/$workspace/settings/general", params: { workspace } })
  },
})
