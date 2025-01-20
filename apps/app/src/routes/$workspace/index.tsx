import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"
import { useWelcomeModal } from "~/components/modals/welcome-modal"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspace/")({
  validateSearch: z.object({
    onboarded: z.boolean().optional(),
  }),

  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { onboarded } = Route.useSearch()
  const { setShowWelcomeModal, WelcomeModal } = useWelcomeModal()

  useEffect(() => {
    if (onboarded) {
      setShowWelcomeModal(true)
    }
  }, [onboarded, setShowWelcomeModal])

  return (
    <>
      <WelcomeModal onClose={() => navigate({ search: {} })} />
      <H3>Dashboard</H3>
    </>
  )
}
