import { cx } from "@openads/ui/cva"
import { Separator } from "@openads/ui/separator"
import { Link } from "@tanstack/react-router"
import { CalendarDays, LayoutDashboardIcon, Megaphone, MousePointer2, Settings } from "lucide-react"
import type { HTMLProps } from "react"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { Logo } from "~/components/ui/logo"
import { UserMenu } from "~/components/user-menu"
import { WorkspaceMenu } from "~/components/workspace-menu"
import { useWorkspace } from "~/contexts/workspace-context"

export const Sidebar = ({ className, ...props }: HTMLProps<HTMLDivElement>) => {
  const { slug: workspaceSlug } = useWorkspace()

  return (
    <div
      className={cx(
        "sticky top-0 h-dvh z-40 flex flex-col border-r w-12 sm:w-48 lg:w-60",
        className,
      )}
      {...props}
    >
      <Nav className="flex-row justify-between px-6">
        <Link to="/">
          <Logo className="h-5 w-auto" />
        </Link>

        <UserMenu />
      </Nav>

      <Separator />

      <Nav>
        <WorkspaceMenu />
      </Nav>

      <Nav>
        <NavMain
          links={[
            {
              title: "Dashboard",
              to: `/${workspaceSlug}`,
              prefix: <LayoutDashboardIcon />,
              activeOptions: { exact: true },
            },
            {
              title: "Ad Spots",
              to: `/${workspaceSlug}/spots`,
              prefix: <MousePointer2 />,
            },
            {
              title: "Bookings",
              to: `/${workspaceSlug}/bookings`,
              prefix: <CalendarDays />,
            },
            {
              title: "Advertisers",
              to: `/${workspaceSlug}/advertisers`,
              prefix: <Megaphone />,
            },
            {
              title: "Settings",
              to: `/${workspaceSlug}/settings`,
              prefix: <Settings />,
            },
          ]}
        />
      </Nav>
    </div>
  )
}
