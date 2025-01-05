"use client"

import { ChevronsUpDown, Plus } from "lucide-react"
import { useState } from "react"

import type { Workspace } from "@openads/db/client"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useIsMobile } from "@openads/ui/hooks"
import { CreateWorkspaceDialog } from "~/components/create-workspace-dialog"

type WorkspaceDropdownProps = {
  workspaces: Workspace[]
}

export const WorkspaceDropdown = ({ workspaces }: WorkspaceDropdownProps) => {
  const isMobile = useIsMobile()
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | undefined>(workspaces[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-6">
            <AvatarImage src={activeWorkspace?.faviconUrl ?? undefined} />
            <AvatarFallback>{activeWorkspace?.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeWorkspace?.name}</span>
            {/* <span className="truncate text-xs">{activeWorkspace?.plan}</span> */}
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>

        {workspaces.map((workspace, index) => (
          <DropdownMenuItem
            key={workspace.name}
            onClick={() => setActiveWorkspace(workspace)}
            className="gap-2 p-2"
          >
            <Avatar className="size-6">
              <AvatarImage src={workspace.faviconUrl ?? undefined} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {workspace.name}
            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <CreateWorkspaceDialog>
          <DropdownMenuItem className="gap-2 p-2" onSelect={e => e.preventDefault()}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            Create workspace
          </DropdownMenuItem>
        </CreateWorkspaceDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
