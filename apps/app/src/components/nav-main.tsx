import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { useIsMobile } from "@openads/ui/hooks"
import { Tooltip, TooltipContent, TooltipTrigger } from "@openads/ui/tooltip"
import type { ReactNode } from "react"
import { NavLink, type NavLinkProps } from "react-router"

type NavMainLink = Omit<NavLinkProps, "prefix"> & {
  prefix?: ReactNode
  label?: string
}

type NavMainProps = {
  links: NavMainLink[]
}

export const NavMain = ({ links }: NavMainProps) => {
  const isMobile = useIsMobile()

  return (
    <>
      {links.map(({ title, label, prefix, ...props }, index) =>
        isMobile ? (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" aria-label={title} prefix={prefix} asChild>
                <NavLink {...props} />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right" className="flex items-center gap-4">
              {title}
              {label && <span className="opacity-60">{label}</span>}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            key={index}
            variant="ghost"
            prefix={prefix}
            suffix={
              label && (
                <Badge variant="outline" className="ml-auto px-1.5 size-auto">
                  {label}
                </Badge>
              )
            }
            className="justify-start"
            asChild
          >
            <NavLink {...props}>{title}</NavLink>
          </Button>
        ),
      )}
    </>
  )
}
