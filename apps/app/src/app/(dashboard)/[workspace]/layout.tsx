import type { PropsWithChildren } from "react"
import { Shell } from "~/components/shell"
import { Toaster } from "~/components/toaster"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Shell>{children}</Shell>
      <Toaster />
    </>
  )
}
