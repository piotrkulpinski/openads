import { cx } from "@openads/ui/cva"
import { Separator } from "@openads/ui/separator"
import { Skeleton } from "@openads/ui/skeleton"
import {
  AppWindowIcon,
  Code2Icon,
  LayoutDashboardIcon,
  MegaphoneIcon,
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

const navs: NavMainItem[][] = [
  [
    {
      title: "Dashboard",
      to: "/",
      prefix: <LayoutDashboardIcon />,
      activeOptions: { exact: true },
    },
    {
      title: "Ad Zones",
      to: "/zones",
      prefix: <AppWindowIcon />,
    },
    {
      title: "Campaigns",
      to: "/campaigns",
      prefix: <MegaphoneIcon />,
    },
    {
      title: "Advertisers",
      to: "/advertisers",
      prefix: <UsersIcon />,
    },
    {
      title: "Settings",
      to: "/settings",
      prefix: <SettingsIcon />,
    },
  ],
  [
    {
      title: "Embed",
      to: "/embed",
      prefix: <Code2Icon />,
    },
  ],
]

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
  const { slug: workspaceSlug } = useWorkspace()

  return (
    <SidebarWrapper {...props}>
      <Nav>
        <WorkspaceMenu />
      </Nav>

      {navs.map((nav, index) => (
        <Fragment key={index}>
          <Separator />

          <Nav>
            <NavMain items={nav.map(link => ({ ...link, to: `/${workspaceSlug}${link.to}` }))} />
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
