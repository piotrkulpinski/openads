import type { PropsWithChildren } from "react"
import { Shell } from "~/components/shell"
import { Toaster } from "~/components/toaster"

type DashboardLayoutProps = PropsWithChildren & {
  params: Promise<{ workspace: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { workspace } = await params

  return (
    <>
      <Shell workspace={workspace}>{children}</Shell>
      <Toaster />
    </>
  )
}
