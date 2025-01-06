"use server"

import { WorkspaceUserRole } from "@openads/db/client"
import { LogEvents } from "@openads/events/events"
import { revalidateTag } from "next/cache"
import { authActionClient } from "~/lib/safe-action"
import { createWorkspaceSchema } from "~/schemas/workspace"
import { slugify } from "~/utils/helpers"

export const createWorkspaceAction = authActionClient
  .schema(createWorkspaceSchema)
  .metadata({
    name: "create-workspace",
    track: {
      event: LogEvents.CreateWorkspace.name,
      channel: LogEvents.CreateWorkspace.channel,
    },
  })
  .action(async ({ parsedInput: { name, websiteUrl }, ctx: { db, user } }) => {
    const workspace = await db.workspace.create({
      data: {
        name: name,
        slug: slugify(name),
        websiteUrl: websiteUrl,
        users: {
          create: {
            userId: user.id,
            role: WorkspaceUserRole.Owner,
          },
        },
      },
    })

    revalidateTag(`user_${user.id}`)
    revalidateTag(`workspaces_${user.id}`)

    // if (redirectTo) {
    //   redirect(redirectTo)
    // }

    return workspace.slug
  })
