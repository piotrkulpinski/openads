import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { H3 } from "~/components/heading"

export const Route = createFileRoute("/$workspace/")({
  validateSearch: z.object({
    onboarded: z.boolean().optional(),
  }),

  component: DashboardPage,
})

function DashboardPage() {
  const { onboarded } = Route.useSearch()

  if (onboarded) {
    // TODO: Add welcome modal
    console.log("onboarded")
  }

  return <H3>Dashboard</H3>
}
