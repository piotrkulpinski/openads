import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { Link } from "@tanstack/react-router"
import type { ComponentProps, ReactNode } from "react"

export type NavMainItem = Omit<ComponentProps<typeof Link>, "prefix"> & {
  prefix?: ReactNode
  label?: string
}

type NavMainProps = {
  items: NavMainItem[]
}

export const NavMain = ({ items }: NavMainProps) => {
  return (
    <>
      {items.map(({ title, label, prefix, ...props }, index) => (
        <Button
          key={index}
          size="lg"
          variant="ghost"
          prefix={prefix}
          suffix={
            label && (
              <Badge variant="secondary" className="ml-auto px-1.5 size-auto">
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
      ))}
    </>
  )
}
