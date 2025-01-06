import { Separator } from "@openads/ui/separator"
import {
  CopyrightIcon,
  GalleryHorizontalEndIcon,
  GemIcon,
  LayoutDashboardIcon,
  ReplaceIcon,
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
    </div>
  )
}
