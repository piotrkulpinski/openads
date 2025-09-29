import type { ComponentProps, ReactNode } from "react"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

type OnboardingStepProps = ComponentProps<typeof Header> & {
  title: ReactNode
  description: ReactNode
}

export const OnboardingStep = ({ children, title, description, ...props }: OnboardingStepProps) => {
  return (
    <Header gap="sm" alignment="center" {...props}>
      <HeaderTitle>{title}</HeaderTitle>
      <HeaderDescription>{description}</HeaderDescription>
      <div className="mt-6 w-full max-w-sm">{children}</div>
    </Header>
  )
}
