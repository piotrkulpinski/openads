import { Button } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type LaterButtonProps = ComponentProps<typeof Button> & {
  next: OnboardingStep | "finish"
  slug?: string
}

export function OnboardingLaterButton({ children, next, slug, ...props }: LaterButtonProps) {
  const { continueTo, finish, isPending, isSuccess } = useOnboardingProgress()

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => (next === "finish" ? finish({ slug }) : continueTo(next, { slug }))}
      isPending={isPending}
      disabled={isPending || isSuccess}
      {...props}
    >
      {children || "I'll do this later"}
    </Button>
  )
}
