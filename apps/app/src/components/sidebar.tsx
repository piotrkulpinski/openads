import { cx } from "@openads/ui/cva"
import { Separator } from "@openads/ui/separator"
import { Skeleton } from "@openads/ui/skeleton"
import {
  Code2Icon,
  LayersIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  Rows3Icon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { type ComponentProps, Fragment } from "react"
import { Nav } from "~/components/nav"
import { NavButtonSkeleton } from "~/components/nav-button"
import { NavMain, type NavMainItem } from "~/components/nav-main"
import { UserMenu } from "~/components/user-menu"
import { WorkspaceMenu } from "~/components/workspace-menu"
import { useWorkspace } from "~/contexts/workspace-context"
import type { FileRoutesByTo } from "~/routeTree.gen"

type RouteParams<TTo extends keyof FileRoutesByTo> = FileRoutesByTo[TTo]["types"]["allParams"]

type WorkspaceNavPath<TTo extends keyof FileRoutesByTo = keyof FileRoutesByTo> =
  TTo extends `/$workspaceId${string}`
    ? RouteParams<TTo> extends { workspaceId: string }
      ? Exclude<keyof RouteParams<TTo>, "workspaceId"> extends never
        ? TTo
        : never
      : never
    : never

type WorkspaceNavItem = Omit<NavMainItem<WorkspaceNavPath>, "params">

const navs = [
  [
    {
      title: "Dashboard",
      to: "/$workspaceId",
      prefix: <LayoutDashboardIcon />,
      activeOptions: { exact: true },
    },
    {
      title: "Tiers",
      to: "/$workspaceId/tiers",
      prefix: <LayersIcon />,
    },
    {
      title: "Fields",
      to: "/$workspaceId/fields",
      prefix: <Rows3Icon />,
    },
    {
      title: "Ads",
      to: "/$workspaceId/ads",
      prefix: <MegaphoneIcon />,
    },
    {
      title: "Advertisers",
      to: "/$workspaceId/advertisers",
      prefix: <UsersIcon />,
    },
    {
      title: "Settings",
      to: "/$workspaceId/settings",
      prefix: <SettingsIcon />,
    },
  ],
  [
    {
      title: "Embed",
      to: "/$workspaceId/embed",
      prefix: <Code2Icon />,
    },
  ],
] satisfies Array<Array<WorkspaceNavItem>>

const SidebarWrapper = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        "sticky top-0 h-dvh z-40 flex flex-col shrink-0 border-r bg-border/10 w-52 transition-[width] lg:w-60",
        className,
      )}
      {...props}
    />
  )
}

const Sidebar = ({ ...props }: ComponentProps<typeof SidebarWrapper>) => {
  const workspace = useWorkspace()

  return (
    <SidebarWrapper {...props}>
      <Nav>
        <WorkspaceMenu />
      </Nav>

      {navs.map((nav, index) => (
        <Fragment key={index}>
          <Separator />

          <Nav>
            <NavMain
              items={nav.map(link => ({ ...link, params: { workspaceId: workspace.id } }))}
            />
          </Nav>
        </Fragment>
      ))}

      <Nav className="mt-auto">
        <UserMenu />
      </Nav>
    </SidebarWrapper>
  )
}

const SidebarSkeleton = ({ ...props }: ComponentProps<typeof SidebarWrapper>) => {
  return (
    <SidebarWrapper {...props}>
      <Nav>
        <NavButtonSkeleton />
      </Nav>

      {navs.map((nav, index) => (
        <Fragment key={index}>
          <Separator />

          <Nav>
            {Array.from({ length: nav.length }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </Nav>
        </Fragment>
      ))}

      <Nav className="mt-auto">
        <NavButtonSkeleton />
      </Nav>
    </SidebarWrapper>
  )
}

export { Sidebar, SidebarSkeleton }
