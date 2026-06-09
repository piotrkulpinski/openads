import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { WelcomeModal } from "~/components/modals/welcome-modal"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/")({
  validateSearch: z.object({
    onboarded: z.boolean().optional(),
  }),

  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { onboarded } = Route.useSearch()

  return (
    <>
      <WelcomeModal
        open={!!onboarded}
        onOpenChange={open => {
          if (!open) navigate({ search: {}, replace: true })
        }}
      />
      <H3>Dashboard</H3>
    </>
  )
}
