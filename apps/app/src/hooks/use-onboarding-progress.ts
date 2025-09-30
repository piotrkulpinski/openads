import type { OnboardingStep } from "@openads/utils"
import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"

export function useOnboardingProgress() {
  const navigate = useNavigate()
  const preWorkspaceSteps = ["welcome", "workspace"]

  const { mutateAsync, isPending, isSuccess } = trpc.onboarding.setProgress.useMutation({
    onError: ({ data }) => {
      toast.error("Failed to update onboarding progress. Please try again.")
      console.error("Failed to update onboarding progress", data)
    },
  })

  const continueTo = useCallback(
    async (step: OnboardingStep, id?: string) => {
      // Update the onboarding progress
      await mutateAsync({ step })

      // If we're on the last step, navigate to the workspace
      if (step === "completed") {
        // If we have a workspace, navigate to it
        if (id) {
          return navigate({
            to: "/$workspaceId",
            params: { workspaceId: id },
            search: { onboarded: true },
          })
        }

        // Otherwise, navigate to the root route
        return navigate({ to: "/" })
      }

      return navigate({
        to: "/onboarding/$step",
        params: { step },
        search: { workspaceId: preWorkspaceSteps.includes(step) ? undefined : id },
      })
    },
    [mutateAsync, navigate],
  )

  return {
    continueTo,
    isPending,
    isSuccess,
  }
}
