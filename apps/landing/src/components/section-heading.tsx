import type { ReactNode } from "react"
import { H2 } from "~/components/heading"

interface SectionHeadingProps {
  children: ReactNode
  subtitle?: string
  className?: string
}

export function SectionHeading({ children, subtitle, className = "" }: SectionHeadingProps) {
  return (
    <div className={`text-left sm:text-center mb-10 md:mb-20 ${className}`} data-reveal>
      <H2>{children}</H2>

      {subtitle && (
        <p className="mt-3 text-foreground/50 text-base/relaxed text-pretty max-w-xl sm:mx-auto md:text-lg/relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
