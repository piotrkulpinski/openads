"use client"

import type { Workspace } from "@openads/db/client"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useIsMobile } from "@openads/ui/hooks"
import { ChevronsUpDown, Plus } from "lucide-react"
import { changeWorkspaceAction } from "~/actions/workspace/change-workspace"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"

type WorkspaceDropdownProps = {
  workspaces: Workspace[]
  defaultWorkspace: Workspace | null
}

export const WorkspaceDropdown = ({ workspaces, defaultWorkspace }: WorkspaceDropdownProps) => {
  const isMobile = useIsMobile()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-6">
            <AvatarImage src={defaultWorkspace?.faviconUrl ?? undefined} />
            <AvatarFallback>{defaultWorkspace?.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{defaultWorkspace?.name}</span>
            {/* <span className="truncate text-xs">{defaultWorkspace?.plan}</span> */}
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

        {workspaces.map(workspace => (
          <DropdownMenuItem
            key={workspace.name}
            onClick={() => changeWorkspaceAction({ workspaceId: workspace.id, redirectTo: "/" })}
            className="gap-2 p-2"
            disabled={workspace.id === defaultWorkspace?.id}
          >
            <Avatar className="size-6">
              <AvatarImage src={workspace.faviconUrl ?? undefined} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {workspace.name}
            {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <CreateWorkspaceDialog>
          <DropdownMenuItem className="gap-2 p-2" onSelect={e => e.preventDefault()}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus />
            </div>
            Create workspace
          </DropdownMenuItem>
        </CreateWorkspaceDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
