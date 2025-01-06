import { ArrowRightIcon } from "lucide-react"
import { NextButton } from "~/app/(onboarding)/onboarding/next-button"
import { H3 } from "~/components/heading"
import { siteConfig } from "~/config/site"

export default function Welcome() {
  return (
    <>
      <H3 as="h1">Welcome to {siteConfig.name}</H3>

      <p className="mt-2 text-muted-foreground">
        {siteConfig.name} gives you marketing superpowers with short links that stand out.
      </p>

      <div className="mt-10 w-full">
        <NextButton step="workspace" suffix={<ArrowRightIcon />}>
          Get started
        </NextButton>
      </div>
    </>
  )
}
