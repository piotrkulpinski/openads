import { cx } from "@openads/ui/cva"
import { Separator } from "@openads/ui/separator"
import {
  CalendarDays,
  Code2,
  LayoutDashboardIcon,
  Megaphone,
  MousePointer2,
  Settings,
} from "lucide-react"
import { type HTMLAttributes, useState } from "react"
import { EmbedModal } from "~/components/modals/embed-modal"
import { Nav } from "~/components/nav"
import { NavMain } from "~/components/nav-main"
import { UserMenu } from "~/components/user-menu"
import { WorkspaceMenu } from "~/components/workspace-menu"
import { useWorkspace } from "~/contexts/workspace-context"

export const Sidebar = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { slug: workspaceSlug } = useWorkspace()
  const [embedOpen, setEmbedOpen] = useState(false)

  return (
    <div
      className={cx(
        "sticky top-0 h-dvh z-40 flex flex-col shrink-0 border-r bg-border/10 w-52 transition-[width] lg:w-60",
        className,
      )}
      {...props}
    >
      <Nav>
        <WorkspaceMenu />
      </Nav>

      <Separator />

      <Nav>
        <NavMain
          items={[
            {
              title: "Dashboard",
              to: `/${workspaceSlug}`,
              prefix: <LayoutDashboardIcon />,
              activeOptions: { exact: true },
            },
            {
              title: "Ad Zones",
              to: `/${workspaceSlug}/zones`,
              prefix: <MousePointer2 />,
            },
            {
              title: "Campaigns",
              to: `/${workspaceSlug}/campaigns`,
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

      <Separator />

      <Nav>
        <NavMain
          items={[
            {
              title: "Embed",
              to: "#",
              prefix: <Code2 />,
              onClick: () => setEmbedOpen(true),
            },
          ]}
        />
      </Nav>

      <EmbedModal open={embedOpen} onOpenChange={setEmbedOpen} />

      <Nav className="mt-auto">
        <UserMenu />
      </Nav>
    </div>
  )
}
