import { Separator } from "@openads/ui/separator"
import {
  CalendarDays,
  ChartSpline,
  LayoutDashboardIcon,
  Megaphone,
  MousePointer2,
} from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Logo } from "~/components/logo"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { UserMenu } from "~/components/user-menu"
import { WorkspaceDropdownSkeleton } from "~/components/workspace-dropdown"
import { WorkspaceMenu } from "~/components/workspace-menu"

export const Sidebar = () => {
  return (
    <div className="sticky top-0 h-dvh z-40 flex flex-col border-r w-12 sm:w-48 lg:w-60">
      <Nav className="flex-row justify-between px-6">
        <Link href="/">
          <Logo className="h-5 w-auto" />
        </Link>

        <UserMenu />
      </Nav>

      <Separator />

      <Nav>
        <Suspense fallback={<WorkspaceDropdownSkeleton />}>
          <WorkspaceMenu />
        </Suspense>
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
              href: "#cc",
              prefix: <MousePointer2 />,
            },
            {
              title: "Bookings",
              href: "#",
              prefix: <CalendarDays />,
            },
            {
              title: "Advertisers",
              href: "#",
              prefix: <Megaphone />,
            },
            {
              title: "Analytics",
              href: "#",
              prefix: <ChartSpline />,
            },
          ]}
        />
      </Nav>
    </div>
  )
}
