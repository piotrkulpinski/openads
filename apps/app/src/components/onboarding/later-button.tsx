import { Button } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type LaterButtonProps = ComponentProps<typeof Button> & {
  next: OnboardingStep | "finish"
}

export function OnboardingLaterButton({ next, children, ...props }: LaterButtonProps) {
  const { continueTo, finish, isPending, isSuccess } = useOnboardingProgress()

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => (next === "finish" ? finish() : continueTo(next))}
      isPending={isPending}
      disabled={isPending || isSuccess}
      {...props}
    >
      {children || "I'll do this later"}
    </Button>
  )
}
