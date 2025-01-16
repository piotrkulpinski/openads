import { cx } from "@openads/ui/cva"
import type { OnboardingStep } from "@openads/utils"
import { LoaderIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type LaterButtonProps = ComponentProps<"button"> & {
  step: OnboardingStep
  slug?: string
}

export function OnboardingLaterButton({ children, step, slug, ...props }: LaterButtonProps) {
  const { continueTo, finish, isPending } = useOnboardingProgress()

  return (
    <button
      type="button"
      onClick={() => (step === "completed" ? finish({ slug }) : continueTo(step, { slug }))}
      disabled={isPending}
      className="flex items-center gap-2 order-last mx-auto text-sm text-muted-foreground hover:text-foreground"
      {...props}
    >
      <LoaderIcon
        className={cx("size-3 animate-spin transition-opacity", !isPending && "opacity-0")}
      />
      {children || "I'll do this later"}
      <div className="w-3" />
    </button>
  )
}
