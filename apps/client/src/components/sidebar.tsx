import { cx } from "@openads/ui/cva"
import { Separator } from "@openads/ui/separator"
import {
  CalendarDays,
  ChartSpline,
  LayoutDashboardIcon,
  Megaphone,
  MousePointer2,
  Settings,
} from "lucide-react"
import type { ComponentProps } from "react"
import { Link } from "react-router"
import { Logo } from "~/components/logo"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { UserMenu } from "~/components/user-menu"
import { WorkspaceMenu } from "~/components/workspace-menu"

export const Sidebar = ({ className, ...props }: ComponentProps<"div">) => {
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
              href: "/",
              prefix: <LayoutDashboardIcon />,
            },
            {
              title: "Ad Spots",
              href: "/spots",
              prefix: <MousePointer2 />,
            },
            {
              title: "Bookings",
              href: "/bookings",
              prefix: <CalendarDays />,
            },
            {
              title: "Advertisers",
              href: "/advertisers",
              prefix: <Megaphone />,
            },
            {
              title: "Analytics",
              href: "/analytics",
              prefix: <ChartSpline />,
            },
            {
              title: "Settings",
              href: "/settings",
              prefix: <Settings />,
            },
          ]}
        />
      </Nav>
    </div>
  )
}
