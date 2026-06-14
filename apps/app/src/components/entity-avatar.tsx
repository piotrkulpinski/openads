import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { cx } from "@openads/ui/cva"
import type { ComponentProps, ReactNode } from "react"

type EntityAvatarProps = ComponentProps<typeof Avatar> & {
  /**
   * The image source (e.g. a favicon URL). When absent, only the fallback renders.
   */
  src?: string | null

  /**
   * The fallback content shown while the image loads or when no `src` is set.
   */
  fallback: ReactNode
}

export const EntityAvatar = ({ src, fallback, className, ...props }: EntityAvatarProps) => {
  return (
    <Avatar className={cx("rounded-md border", className)} {...props}>
      {src && <AvatarImage src={src} className="p-[7.5%]" />}
      <AvatarFallback className="rounded-none">{fallback}</AvatarFallback>
    </Avatar>
  )
}
