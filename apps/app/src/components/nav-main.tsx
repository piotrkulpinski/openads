import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { Link } from "@tanstack/react-router"
import type { LinkComponentProps, RegisteredRouter } from "@tanstack/react-router"
import type { ComponentProps, ReactNode } from "react"
import type { FileRouteTypes } from "~/routeTree.gen"

export type NavMainItem<TTo extends FileRouteTypes["to"] = FileRouteTypes["to"]> = Omit<
  LinkComponentProps<"a", RegisteredRouter, string, TTo>,
  "children" | "prefix" | "title"
> & {
  title: string
  prefix?: ReactNode
  label?: string
}

type NavMainProps<TTo extends FileRouteTypes["to"]> = {
  items: Array<NavMainItem<TTo>>
}

export const NavMain = <TTo extends FileRouteTypes["to"]>({ items }: NavMainProps<TTo>) => {
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
          <Link
            activeProps={{ className: "bg-accent" }}
            {...(props as ComponentProps<typeof Link>)}
          >
            {title}
          </Link>
        </Button>
      ))}
    </>
  )
}
