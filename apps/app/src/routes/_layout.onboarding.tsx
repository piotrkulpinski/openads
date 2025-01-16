import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/onboarding")({
  beforeLoad: async ({ context: { trpcUtils } }) => {
    const step = await trpcUtils.onboarding.getProgress.fetch()

    if (step === "completed") {
      throw redirect({ to: "/" })
    }
  },
})
