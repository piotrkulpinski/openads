import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { Skeleton } from "@openads/ui/skeleton"
import { getInitials } from "@primoui/utils"
import { ComponentProps } from "react"

type NavButtonProps = ComponentProps<typeof Button> & {
  title: string
  subtitle?: string
  avatar?: string
}

const NavButton = ({ className, avatar, title, subtitle, ...props }: NavButtonProps) => {
  return (
    <Button size="sm" variant="ghost" className={cx("gap-3", className)} {...props}>
      <Avatar className="size-8 md:size-10">
        <AvatarImage src={avatar} />
        <AvatarFallback>{getInitials(title)}</AvatarFallback>
      </Avatar>

      <div className="grid gap-1 flex-1 text-left text-sm/tight">
        <span className="truncate font-medium">{title}</span>

        {subtitle && (
          <span className="truncate text-xs/tight text-muted-foreground/75">{subtitle}</span>
        )}
      </div>
    </Button>
  )
}

const NavButtonSkeleton = ({ className, ...props }: ComponentProps<typeof Button>) => {
  return (
    <Button size="sm" variant="ghost" disabled className={cx("gap-3", className)} {...props}>
      <Skeleton className="size-8 md:size-10" />

      <div className="grid gap-1 flex-1 text-left text-sm/tight">
        <Skeleton className="w-24">&nbsp;</Skeleton>
        <Skeleton className="w-16 text-xs/tight">&nbsp;</Skeleton>
      </div>
    </Button>
  )
}

export { NavButton, NavButtonSkeleton }
