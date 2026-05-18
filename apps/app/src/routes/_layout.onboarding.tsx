import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/onboarding")({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const step = await queryClient.fetchQuery(orpc.onboarding.getProgress.queryOptions())

    if (step === "completed") {
      throw redirect({ to: "/" })
    }
  },
})
