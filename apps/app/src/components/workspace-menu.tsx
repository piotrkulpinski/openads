import { useHotkeys } from "@mantine/hooks"
import type { Workspace } from "@openads/db/client"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { cx } from "@openads/ui/cva"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useNavigate } from "@tanstack/react-router"
import { Check, ChevronDownIcon, Plus } from "lucide-react"
import { NavButton, NavButtonSkeleton } from "~/components/nav-button"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc, trpcUtils } from "~/lib/trpc"
import { getWorkspaceFaviconUrl } from "~/lib/workspaces"

export const WorkspaceMenu = () => {
  const activeWorkspace = useWorkspace()
  const navigate = useNavigate()

  const { data: workspaces, isFetching } = trpc.workspace.getAll.useQuery(undefined, {
    initialData: [],
  })

  const changeDefaultWorkspace = trpc.workspace.changeDefault.useMutation({
    onSuccess: () => {
      trpcUtils.user.me.invalidate()
    },
  })

  const changeWorkspace = (workspace?: Workspace) => {
    if (!workspace || workspace.slug === activeWorkspace.slug) return

    changeDefaultWorkspace.mutate({ workspaceId: workspace.id })
    navigate({ to: "/$workspace", params: { workspace: workspace.slug } })
  }

  useHotkeys(
    [...Array(9).keys()].map(index => [
      `mod+${index + 1}`,
      e => changeWorkspace(workspaces[Number.parseInt(e.key, 10) - 1]),
    ]),
  )

  if (isFetching) {
    return <NavButtonSkeleton suffix={<ChevronDownIcon />} />
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <NavButton
          title={activeWorkspace.name}
          subtitle={`${activeWorkspace.plan} Plan`}
          avatar={getWorkspaceFaviconUrl(activeWorkspace)}
          suffix={<ChevronDownIcon />}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>

        {workspaces.map((workspace, index) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => changeWorkspace(workspace)}
            className={cx(
              "gap-2 p-2",
              workspace.slug === activeWorkspace.slug && "bg-accent opacity-75 pointer-events-none",
            )}
          >
            <Avatar className="size-5 m-0.5">
              <AvatarImage src={getWorkspaceFaviconUrl(workspace)} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <span className="truncate text-sm/tight font-medium">{workspace.name}</span>

            {workspace.slug === activeWorkspace.slug ? (
              <Check className="ml-auto text-green-500" />
            ) : (
              index < 9 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            )}
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
