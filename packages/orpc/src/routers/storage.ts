import { randomUUID } from "node:crypto"
import { slugify } from "@dirstack/utils"
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@openads/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authProcedure, publicProcedure } from "../index"

const uploadImageInput = z.object({
  file: z
    .string()
    .trim()
    .min(1, "File data is required")
    .regex(/^data:[^;,]+;base64,/, "Expected a base64-encoded data URL"),
  fileName: z.string().trim().min(1, "File name is required"),
  contentType: z.string().trim().optional(),
})

const generateObjectKey = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "png"
  const baseName = slugify(fileName.replace(/\.[^.]+$/, "")).slice(0, 40) || "file"

  // A short random suffix is plenty for uniqueness within the workspace prefix —
  // a timestamp + full UUID just made the public asset URLs needlessly long.
  return `${baseName}-${randomUUID().slice(0, 8)}.${extension}`
}

const allowedImageTypes = new Set<string>(ALLOWED_IMAGE_TYPES)
const ADVERTISER_UPLOAD_TTL_SECONDS = 60 * 5 // 5 minutes to PUT after issuing the URL
const ADVERTISER_UPLOAD_RATE_LIMIT = 20 // uploads per hour per checkout session
const ADVERTISER_UPLOAD_WINDOW_SECONDS = 60 * 60

export const storageRouter = {
  uploadUserImage: authProcedure
    .input(uploadImageInput)
    .handler(async ({ context: { s3, user }, input: { file, fileName, contentType } }) => {
      // Same guardrails as the advertiser upload: derive the content type
      // (explicit input wins over the data-URL prefix) and enforce the
      // allowlist + size cap before anything touches storage.
      const resolvedContentType = contentType || file.match(/^data:([^;,]+)[;,]/)?.[1]

      if (!resolvedContentType || !allowedImageTypes.has(resolvedContentType)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Unsupported file type. Use PNG, JPEG, or WebP.",
        })
      }

      const body = Buffer.from(file.slice(file.indexOf(",") + 1), "base64")

      if (body.byteLength > MAX_UPLOAD_BYTES) {
        throw new ORPCError("BAD_REQUEST", {
          message: "File is too large. Maximum upload size is 2 MB.",
        })
      }

      const key = `users/${user.id}/${generateObjectKey(fileName)}`

      return s3.uploadObject({
        key,
        body,
        contentType: resolvedContentType,
        cacheControl: "public, max-age=31536000",
      })
    }),

  // Anonymous endpoint: the Stripe Checkout session is the only auth, so
  // rate-limit per session to bound abuse from a leaked session id.
  public: {
    createAdvertiserUpload: publicProcedure
      .input(
        z.object({
          workspaceId: z.string().min(1),
          sessionId: z.string().min(1),
          fileName: z.string().min(1).max(200),
          contentType: z.string().min(1),
          contentLength: z.number().int().positive(),
        }),
      )
      .handler(
        async ({
          context: { db, s3, stripe, redis },
          input: { workspaceId, sessionId, fileName, contentType, contentLength },
        }) => {
          if (!allowedImageTypes.has(contentType)) {
            throw new ORPCError("BAD_REQUEST", {
              message: "Unsupported file type. Use PNG, JPEG, or WebP.",
            })
          }

          if (contentLength > MAX_UPLOAD_BYTES) {
            throw new ORPCError("BAD_REQUEST", {
              message: "File is too large. Maximum upload size is 2 MB.",
            })
          }

          // Metered before the DB and Stripe round trips so replaying a known
          // session id never gets unmetered upstream calls. Random-id probing
          // would need a per-IP limit — out of scope here.
          const rateKey = `storage:advertiser-upload:${sessionId}`
          const count = await redis.incr(rateKey)
          if (count === 1) {
            await redis.expire(rateKey, ADVERTISER_UPLOAD_WINDOW_SECONDS)
          }
          if (count > ADVERTISER_UPLOAD_RATE_LIMIT) {
            throw new ORPCError("TOO_MANY_REQUESTS", {
              message: "Too many uploads from this checkout. Please try again later.",
            })
          }

          const workspace = await db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, stripeConnectId: true },
          })

          if (!workspace?.stripeConnectId) {
            throw new ORPCError("PRECONDITION_FAILED", {
              message: "This publisher cannot accept payments yet.",
            })
          }

          const session = await stripe.checkout.sessions.retrieve(
            sessionId,
            {},
            { stripeAccount: workspace.stripeConnectId },
          )

          if (session.status !== "complete") {
            throw new ORPCError("PRECONDITION_FAILED", {
              message: "Checkout has not completed yet.",
            })
          }

          if (session.metadata?.workspaceId !== workspaceId) {
            throw new ORPCError("BAD_REQUEST", { message: "Missing checkout metadata." })
          }

          // Scoped to the workspace; the random key guarantees uniqueness. We don't
          // fold the (long) Stripe session id into the path — uploads only happen
          // after a completed checkout, so there are no orphans to group by session.
          const objectKey = `workspaces/${workspaceId}/uploads/${generateObjectKey(fileName)}`

          // Presigned PUT — R2 doesn't implement presigned POST (returns 501).
          // The signed content-length pins the exact byte count, so the 2 MB cap
          // is enforced by the storage backend, not just the check above.
          const uploadUrl = await s3.getSignedUploadUrl({
            key: objectKey,
            contentType,
            contentLength,
            expiresInSeconds: ADVERTISER_UPLOAD_TTL_SECONDS,
          })

          return {
            uploadUrl,
            // The client must send these exact headers on the PUT — they're signed.
            headers: { "Content-Type": contentType },
            publicUrl: s3.getPublicUrl({ key: objectKey }),
            key: objectKey,
          }
        },
      ),
  },
}
