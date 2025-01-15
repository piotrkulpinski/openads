import { createFileRoute } from "@tanstack/react-router"
import { Outlet } from "@tanstack/react-router"
import { Logo } from "~/components/logo"

export const Route = createFileRoute("/_layout")({
  component: () => (
    <div className="relative min-h-dvh w-full bg-primary-foreground/50">
      <div className="absolute top-0 left-1/2 h-64 w-2/3 rounded-lg overflow-clip blur-2xl pointer-events-none -translate-x-1/2">
        <div className="-mt-20 size-full -rotate-12 bg-primary/15 rounded-full" />
      </div>

      <div className="relative z-10 mx-auto my-8 flex flex-col items-center px-3 text-center md:px-8">
        <div className="relative flex w-auto items-center justify-center px-6 py-2">
          <Logo className="h-8 w-auto" />
        </div>

        <div className="mt-16 flex w-full max-w-sm flex-col items-center md:mt-20 lg:max-w-md lg:mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  ),
})
