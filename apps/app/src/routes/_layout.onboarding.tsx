import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/onboarding")({
  beforeLoad: async ({ context: { trpc } }) => {
    const step = await trpc.onboarding.getProgress.fetch()

    if (step === "completed") {
      throw redirect({ to: "/" })
    }
  },
})
