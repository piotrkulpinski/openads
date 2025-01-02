import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarDays,
  ChartSpline,
  Command,
  GalleryVerticalEnd,
  Megaphone,
  MousePointer2,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import type { ComponentProps } from "react"

import { NavMain } from "~/components/nav-main"
import { NavUser } from "~/components/nav-user"
import { NavWorkspace } from "~/components/nav-workspace"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"
import { WorkspaceSwitcher } from "~/components/workspace-switcher"

// This is sample data.
const data = {
  workspaces: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEnd />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioWaveform />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <Command />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <SquareTerminal />,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <Bot />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <BookOpen />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2 />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Ad Spots",
      url: "#cc",
      icon: <MousePointer2 />,
    },
    {
      name: "Bookings",
      url: "#",
      icon: <CalendarDays />,
    },
    {
      name: "Advertisers",
      url: "#",
      icon: <Megaphone />,
    },
    {
      name: "Analytics",
      url: "#",
      icon: <ChartSpline />,
    },
  ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={data.workspaces} />
      </SidebarHeader>

      <SidebarContent>
        <NavWorkspace projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
