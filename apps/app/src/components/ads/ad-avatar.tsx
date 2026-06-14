import { getInitials } from "@dirstack/utils"
import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"
import { ServingDot, type ServingState } from "~/components/ads/serving-state"
import { EntityAvatar } from "~/components/entity-avatar"

type AdAvatarProps = ComponentProps<"span"> & {
  ad: { name: string; faviconUrl: string | null }
  serving?: ServingState
}

export const AdAvatar = ({ ad, serving, className, ...props }: AdAvatarProps) => {
  return (
    <span className={cx("relative shrink-0", className)} {...props}>
      <EntityAvatar className="size-9" src={ad.faviconUrl} fallback={getInitials(ad.name, 3)} />

      {/* Presence-style serving indicator, anchored to the favicon */}
      {serving && (
        <span
          className="-right-0.5 -bottom-0.5 absolute rounded-full bg-background p-0.5"
          title={serving.detail}
        >
          <ServingDot state={serving} />
        </span>
      )}
    </span>
  )
}
