import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/onboarding/")({
  loader: () => {
    return redirect({ to: "/onboarding/$step", params: { step: "welcome" } })
  },
})
