import { Button } from "@openads/ui/button"
import { Separator } from "@openads/ui/separator"
import {
  CopyrightIcon,
  GalleryHorizontalEndIcon,
  GemIcon,
  LayoutDashboardIcon,
  ReplaceIcon,
} from "lucide-react"
import { Suspense } from "react"
import { CreateWorkspaceDialog } from "~/components/create-workspace-dialog"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { SignOutButton } from "~/components/sign-out-button"
import { WorkspaceMenu } from "~/components/workspace-menu"

export const Sidebar = () => {
  return (
    <div className="sticky top-0 h-dvh z-40 flex flex-col border-r w-12 sm:w-48 lg:w-60">
      <Nav>
        <Suspense>
          <WorkspaceMenu />
        </Suspense>
      </Nav>

      <Separator />

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
      <CreateWorkspaceDialog>
        <Button>Create workspace</Button>
      </CreateWorkspaceDialog>

      <Nav className="mt-auto">
        <SignOutButton />
      </Nav>
    </div>
  )
}
