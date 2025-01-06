"use server"

import { LogEvents } from "@openads/events/events"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { authActionClient } from "~/lib/safe-action"
import { changeWorkspaceSchema } from "~/schemas/workspace"

export const changeWorkspaceAction = authActionClient
  .schema(changeWorkspaceSchema)
  .metadata({
    name: "change-workspace",
    track: {
      event: LogEvents.ChangeWorkspace.name,
      channel: LogEvents.ChangeWorkspace.channel,
    },
  })
  .action(async ({ parsedInput: { workspaceId, redirectTo }, ctx: { db, user } }) => {
    const workspace = await db.workspace.update({
      where: { id: workspaceId },
      data: { defaultFor: { connect: { id: user.id } } },
    })

    if (!workspace) {
      return
    }

    revalidateTag(`user_${user.id}`)

    redirect(redirectTo)
  })
