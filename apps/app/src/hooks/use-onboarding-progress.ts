import type { OnboardingStep } from "@openads/utils"
import { useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"

const PRE_WORKSPACE_STEPS = ["workspace"]

export function useOnboardingProgress() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const slug = searchParams.get("workspace")

  const { mutate, mutateAsync, isPending, isSuccess } = trpc.onboarding.setProgress.useMutation({
    onSuccess: () => {
      console.log("Onboarding progress updated")
    },
    onError: ({ data }) => {
      toast.error("Failed to update onboarding progress. Please try again.")
      console.error("Failed to update onboarding progress", data)
    },
  })

  const continueTo = useCallback(
    async (step: OnboardingStep, { slug: providedSlug }: { slug?: string } = {}) => {
      mutate({ step })

      const queryParams = PRE_WORKSPACE_STEPS.includes(step)
        ? ""
        : `?workspace=${providedSlug || slug}`

      navigate(`/onboarding/${step}${queryParams}`)
    },
    [mutate, navigate, slug],
  )

  const finish = useCallback(async () => {
    await mutateAsync({ step: "completed" })

    navigate(slug ? `/${slug}?onboarded=true` : "/")
  }, [mutateAsync, navigate, slug])

  return {
    continueTo,
    finish,
    isPending,
    isSuccess,
  }
}
