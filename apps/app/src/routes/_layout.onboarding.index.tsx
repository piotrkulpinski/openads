import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/onboarding/")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/$step", params: { step: "welcome" } })
  },
})
