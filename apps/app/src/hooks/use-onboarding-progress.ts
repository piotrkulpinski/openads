import type { OnboardingStep } from "@openads/utils"
import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"

type ContinueToParams = {
  slug?: string
}

export function useOnboardingProgress() {
  const navigate = useNavigate()
  const preWorkspaceSteps = ["workspace"]

  const { mutate, mutateAsync, isPending, isSuccess } = trpc.onboarding.setProgress.useMutation({
    onError: ({ data }) => {
      toast.error("Failed to update onboarding progress. Please try again.")
      console.error("Failed to update onboarding progress", data)
    },
  })

  const continueTo = useCallback(
    async (step: OnboardingStep, { slug }: ContinueToParams = {}) => {
      const workspaceParam = preWorkspaceSteps.includes(step) ? undefined : slug

      mutate({ step })

      navigate({
        to: "/onboarding/$step",
        params: { step },
        search: { workspace: workspaceParam },
      })
    },
    [mutate, navigate],
  )

  const finish = useCallback(
    async ({ slug }: ContinueToParams = {}) => {
      await mutateAsync({ step: "completed" })

      // If we have a workspace, navigate to it, otherwise navigate to the root route
      navigate(slug ? { to: "/$workspace", params: { workspace: slug } } : { to: "/" })
    },
    [mutateAsync, navigate],
  )

  return {
    continueTo,
    finish,
    isPending,
    isSuccess,
  }
}
