import type { PropsWithChildren } from "react"
import { Sidebar } from "~/components/sidebar"

type ShellProps = PropsWithChildren & {
  workspace: string
}

export const Shell = ({ children, workspace }: ShellProps) => {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar workspace={workspace} />

      <div className="grid grid-cols-1 content-start gap-4 p-4 flex-1 sm:px-6">{children}</div>
    </div>
  )
}
