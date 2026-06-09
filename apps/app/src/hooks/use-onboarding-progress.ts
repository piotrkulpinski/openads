import type { OnboardingStep } from "@openads/utils"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { logger } from "~/lib/logger"
import { orpc } from "~/lib/orpc"

const preWorkspaceSteps = ["welcome", "workspace"]

export const useOnboardingProgress = () => {
  const navigate = useNavigate()

  const { mutateAsync, isPending, isSuccess } = useMutation(
    orpc.onboarding.setProgress.mutationOptions({
      onError: error => {
        logger.error("onboarding.setProgress failed", { err: error })
        toast.error("Failed to update onboarding progress. Please try again.")
      },
    }),
  )

  const continueTo = async (step: OnboardingStep, id?: string) => {
    // Persist progress before navigation so refreshes resume from the next step.
    await mutateAsync({ step })

    if (step === "completed") {
      // A completed onboarding run should land in the created workspace when possible.
      if (id) {
        return navigate({
          to: "/$workspaceId",
          params: { workspaceId: id },
          search: { onboarded: true },
        })
      }

      // Fallback for cases where the workspace was already deleted or never created.
      return navigate({ to: "/" })
    }

    return navigate({
      to: "/onboarding/$step",
      params: { step },
      search: { workspaceId: preWorkspaceSteps.includes(step) ? undefined : id },
    })
  }

  return {
    continueTo,
    isPending,
    isSuccess,
  }
}
