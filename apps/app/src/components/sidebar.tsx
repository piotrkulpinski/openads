"use client"

import { Separator, useIsMobile } from "@openads/ui"
import {
  CopyrightIcon,
  GalleryHorizontalEndIcon,
  GemIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ReplaceIcon,
} from "lucide-react"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { signOut } from "~/lib/auth/client"
import { cx } from "~/utils/cva"

export const Sidebar = () => {
  const isMobile = useIsMobile()

  return (
    <div
      className={cx("sticky top-0 h-dvh z-40 flex flex-col border-r", isMobile ? "w-12" : "w-48")}
    >
      <Nav>
        <NavMain
          isCollapsed={isMobile}
          links={[
            {
              title: "Dashboard",
              href: "/admin",
              prefix: <LayoutDashboardIcon />,
            },
          ]}
        />
      </Nav>

      <Separator />

      <Nav>
        <NavMain
          isCollapsed={isMobile}
          links={[
            {
              title: "Tools",
              href: "/tools",
              prefix: <GemIcon />,
            },
            {
              title: "Alternatives",
              href: "/alternatives",
              prefix: <ReplaceIcon />,
            },
            {
              title: "Categories",
              href: "/categories",
              prefix: <GalleryHorizontalEndIcon />,
            },
            {
              title: "Licenses",
              href: "/licenses",
              prefix: <CopyrightIcon />,
            },
          ]}
        />
      </Nav>

      <Nav className="mt-auto">
        <NavMain
          isCollapsed={isMobile}
          links={[
            {
              title: "Sign Out",
              href: "#",
              onClick: () => signOut(),
              prefix: <LogOutIcon />,
            },
          ]}
        />
      </Nav>
    </div>
  )
}
