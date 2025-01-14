import { cx } from "@openads/ui/cva"
import type { ComponentProps, ReactNode } from "react"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"

type StepPageProps = ComponentProps<typeof Intro> & {
  title: ReactNode
  description: ReactNode
}

export const StepPage = ({ children, className, title, description, ...props }: StepPageProps) => {
  return (
    <Intro alignment="center" className={cx(className)} {...props}>
      <IntroTitle>{title}</IntroTitle>
      <IntroDescription>{description}</IntroDescription>
      <div className="mt-8 w-full">{children}</div>
    </Intro>
  )
}
