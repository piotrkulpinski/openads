import { cx } from "@openads/ui/cva"
import { Rows3Icon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { Prose } from "~/components/ui/prose"

export const FieldsEmptyState = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center p-6 mx-auto space-y-2 text-center col-span-full",
        className,
      )}
      {...props}
    >
      <Rows3Icon className="size-12 p-3 bg-muted text-muted-foreground rounded-md" />
      <Prose className="max-w-2xs">{children}</Prose>
    </div>
  )
}
