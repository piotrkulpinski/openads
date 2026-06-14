import { WorkspaceMemberRole } from "@openads/db/client"
import { idSchema, workspaceSchema } from "@openads/db/schema"
import { LogEvents } from "@openads/events/events"
import { fetchAndUploadFavicon } from "@openads/s3/favicon"
import { z } from "zod"
import { authProcedure, type Context, workspaceMw } from "../index"

const workspaceUpdateInput = workspaceSchema.extend({ workspaceId: z.string() })

/**
 * Fetches the workspace favicon from the logo service, re-hosts it on R2 and
 * persists the R2 URL. Best-effort — failure is logged and leaves the
 * existing `faviconUrl` untouched.
 */
const refreshWorkspaceFavicon = async (
  { db, s3, logger, env }: Pick<Context, "db" | "s3" | "logger" | "env">,
  { workspaceId, websiteUrl }: { workspaceId: string; websiteUrl: string },
) => {
  const faviconUrl = await fetchAndUploadFavicon(s3, {
    websiteUrl,
    logoLinkClientId: env.LOGO_LINK_CLIENT_ID,
    key: `workspaces/${workspaceId}/favicon.png`,
  }).catch(err => {
    logger.warn("workspace: favicon fetch failed", { err, workspaceId, websiteUrl })
    return null
  })

  if (!faviconUrl) return null

  return await db.workspace.update({
    where: { id: workspaceId },
    data: { faviconUrl },
  })
}

export const workspaceRouter = {
  getAll: authProcedure.handler(async ({ context: { db, user } }) => {
    return await db.workspace.findMany({
      where: db.workspace.belongsTo(user.id),
      orderBy: { createdAt: "asc" },
    })
  }),

  getById: authProcedure
    .input(idSchema)
    .handler(async ({ context: { db, user }, input: { id } }) => {
      return await db.workspace.findFirst({
        where: { AND: [{ id }, db.workspace.belongsTo(user.id)] },
      })
    }),

  create: authProcedure
    .input(workspaceSchema)
    .handler(async ({ context: { analytics, db, env, logger, s3, user }, input: data }) => {
      const workspace = await db.workspace.create({
        data: {
          ...data,
          members: { create: { userId: user.id, role: WorkspaceMemberRole.Owner } },
        },
      })

      // Enrich the OpenPanel profile so server events are attributable to a
      // named user, not just an id. Idempotent — safe to repeat per workspace.
      const [firstName, ...rest] = (user.name ?? "").split(" ")
      analytics.identify({
        profileId: user.id,
        email: user.email,
        firstName,
        lastName: rest.join(" ") || undefined,
      })

      analytics.track({
        event: LogEvents.CreateWorkspace.name,
        channel: LogEvents.CreateWorkspace.channel,
        profileId: user.id,
        workspaceId: workspace.id,
      })

      const refreshed = await refreshWorkspaceFavicon(
        { db, s3, logger, env },
        { workspaceId: workspace.id, websiteUrl: workspace.websiteUrl },
      )

      return refreshed ?? workspace
    }),

  update: authProcedure
    .input(workspaceUpdateInput)
    .use(workspaceMw)
    .handler(
      async ({
        context: { db, env, logger, s3, workspace: current },
        input: { workspaceId, ...data },
      }) => {
        const websiteUrlChanged = data.websiteUrl !== current.websiteUrl

        const workspace = await db.workspace.update({
          where: { id: workspaceId },
          data,
        })

        if (websiteUrlChanged) {
          const refreshed = await refreshWorkspaceFavicon(
            { db, s3, logger, env },
            { workspaceId, websiteUrl: workspace.websiteUrl },
          )

          return refreshed ?? workspace
        }

        return workspace
      },
    ),

  delete: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db, s3, logger }, input: { workspaceId } }) => {
      const workspace = await db.workspace.delete({
        where: { id: workspaceId },
      })

      // Best-effort R2 cleanup of everything re-hosted under the workspace
      // prefix (favicons, advertiser uploads). Runs after the DB delete so a
      // failed delete never destroys live assets, and never fails the mutation.
      await s3
        .deletePrefix({ prefix: `workspaces/${workspaceId}` })
        .catch(err => logger.warn("workspace: R2 cleanup failed", { err, workspaceId }))

      return workspace
    }),

  changeDefault: authProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceMw)
    .handler(async ({ context: { db, user }, input: { workspaceId } }) => {
      const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data: { defaultFor: { connect: { id: user.id } } },
      })

      return workspace
    }),
}
