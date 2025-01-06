import type { PropsWithChildren } from "react"
import { Logo } from "~/components/logo"

export default function OnboardingLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-dvh w-full bg-primary-foreground">
      <div className="absolute top-0 left-1/2 h-64 w-2/3 rounded-lg overflow-clip blur-2xl pointer-events-none -translate-x-1/2">
        <div className="-mt-12 size-full -rotate-12 bg-primary/15 rounded-full" />
      </div>

      <div className="relative mx-auto mt-24 flex max-w-sm flex-col items-center px-3 text-center md:mt-32 md:px-8 lg:mt-48 lg:max-w-lg">
        <div className="relative flex w-auto items-center justify-center px-6 py-2">
          <Logo className="h-8 w-auto" />
        </div>

        <div className="mt-8 flex w-full flex-col items-center px-4 pb-16 md:mt-12 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  )
}
