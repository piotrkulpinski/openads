import type { ReactNode } from "react"

interface SectionHeadingProps {
  children: ReactNode
  subtitle?: string
  className?: string
}

export function SectionHeading({ children, subtitle, className = "" }: SectionHeadingProps) {
  return (
    <div className={`text-center mb-14 md:mb-20 ${className}`} data-reveal>
      <h2 className="text-3xl/tight font-semibold tracking-tight text-balance md:text-4xl/tight">
        {children}
      </h2>

      {subtitle && (
        <p className="mt-3 text-foreground/50 text-base/relaxed text-pretty max-w-xl mx-auto md:text-lg/relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
