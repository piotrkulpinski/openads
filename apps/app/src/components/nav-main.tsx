import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { useIsMobile } from "@openads/ui/hooks"
import { TooltipContent, TooltipRoot, TooltipTrigger } from "@openads/ui/tooltip"
import { Link } from "@tanstack/react-router"
import type { ComponentProps, ReactNode } from "react"

type NavMainItem = Omit<ComponentProps<typeof Link>, "prefix"> & {
  prefix?: ReactNode
  label?: string
}

type NavMainProps = {
  items: NavMainItem[]
}

export const NavMain = ({ items }: NavMainProps) => {
  const isMobile = useIsMobile()

  return (
    <>
      {items.map(({ title, label, prefix, ...props }, index) =>
        isMobile ? (
          <TooltipRoot key={index}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" aria-label={title} prefix={prefix} asChild>
                <Link activeProps={{ className: "bg-accent" }} {...props} />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right" className="flex items-center gap-4">
              {title}
              {label && <span className="opacity-60">{label}</span>}
            </TooltipContent>
          </TooltipRoot>
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
            <Link activeProps={{ className: "bg-accent" }} {...props}>
              {title}
            </Link>
          </Button>
        ),
      )}
    </>
  )
}
