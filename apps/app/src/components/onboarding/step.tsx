import { cx } from "@openads/ui/cva"
import type { ComponentProps, ReactNode } from "react"
import { Intro, IntroDescription, IntroTitle } from "~/components/ui/intro"

type OnboardingStepProps = ComponentProps<typeof Intro> & {
  title: ReactNode
  description: ReactNode
}

export const OnboardingStep = ({
  children,
  className,
  title,
  description,
  ...props
}: OnboardingStepProps) => {
  return (
    <Intro alignment="center" className={cx(className)} {...props}>
      <IntroTitle>{title}</IntroTitle>
      <IntroDescription>{description}</IntroDescription>
      <div className="mt-6 w-full max-w-sm">{children}</div>
    </Intro>
  )
}
