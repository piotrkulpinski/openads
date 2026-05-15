import { randomUUID } from "node:crypto"
import { slugify } from "@dirstack/utils"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { authProcedure, publicProcedure, router, workspaceProcedure } from "../index"

const uploadImageInput = z.object({
  file: z.string().trim().min(1, "File data is required"),
  fileName: z.string().trim().min(1, "File name is required"),
  contentType: z.string().trim().optional(),
  cacheControl: z.string().trim().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

function generateObjectKey(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "png"
  const baseName = slugify(fileName.replace(/\.[^.]+$/, "")) || "file"

  return `${baseName}-${Date.now()}-${randomUUID()}.${extension}`
}

// SVG is intentionally excluded — it can execute JS when rendered via <img>
// from a same-origin asset host.
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

const MAX_ADVERTISER_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB
const ADVERTISER_UPLOAD_TTL_SECONDS = 60 * 5 // 5 minutes to PUT after issuing the URL
const ADVERTISER_UPLOAD_RATE_LIMIT = 20 // uploads per hour per checkout session
const ADVERTISER_UPLOAD_WINDOW_SECONDS = 60 * 60

export const storageRouter = router({
  uploadUserImage: authProcedure
    .input(uploadImageInput)
    .mutation(async ({ ctx: { s3, user }, input: { file, fileName, ...props } }) => {
      const body = Buffer.from(file.split(",")[1]!, "base64")
      const key = `users/${user.id}/${generateObjectKey(fileName)}`

      return s3.uploadObject({ key, body, ...props })
    }),

  deleteUser: authProcedure.mutation(async ({ ctx: { s3, user } }) => {
    return await s3.deletePrefix({ prefix: `users/${user.id}` })
  }),

  deleteWorkspace: workspaceProcedure.mutation(async ({ ctx: { s3, workspace } }) => {
    return await s3.deletePrefix({ prefix: `workspaces/${workspace.id}` })
  }),

  // Anonymous endpoint: the Stripe Checkout session is the only auth, so
  // rate-limit per session to bound abuse from a leaked session id.
  public: router({
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
      .mutation(
        async ({
          ctx: { db, s3, stripe, redis },
          input: { workspaceId, sessionId, fileName, contentType, contentLength },
        }) => {
          if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Unsupported file type. Use PNG, JPEG, or WebP.",
            })
          }

          if (contentLength > MAX_ADVERTISER_UPLOAD_BYTES) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "File is too large. Maximum upload size is 2 MB.",
            })
          }

          const workspace = await db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, stripeConnectId: true },
          })

          if (!workspace?.stripeConnectId) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "This publisher cannot accept payments yet.",
            })
          }

          const session = await stripe.checkout.sessions.retrieve(
            sessionId,
            {},
            { stripeAccount: workspace.stripeConnectId },
          )

          if (session.status !== "complete") {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Checkout has not completed yet.",
            })
          }

          if (session.metadata?.workspaceId !== workspaceId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Missing checkout metadata." })
          }

          const rateKey = `storage:advertiser-upload:${sessionId}`
          const count = await redis.incr(rateKey)
          if (count === 1) {
            await redis.expire(rateKey, ADVERTISER_UPLOAD_WINDOW_SECONDS)
          }
          if (count > ADVERTISER_UPLOAD_RATE_LIMIT) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "Too many uploads from this checkout. Please try again later.",
            })
          }

          const objectKey = `workspaces/${workspaceId}/uploads/${sessionId}/${generateObjectKey(fileName)}`

          // Presigned POST (not PUT) so the size cap is enforced server-side
          // at S3 via `content-length-range`.
          const presigned = await s3.createSignedPost({
            key: objectKey,
            expiresInSeconds: ADVERTISER_UPLOAD_TTL_SECONDS,
            contentLengthRange: { max: MAX_ADVERTISER_UPLOAD_BYTES },
            // S3 requires the form to echo every signed field with the exact
            // value, so these are returned to the client alongside `conditions`.
            fields: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
            conditions: [
              ["eq", "$Content-Type", contentType],
              ["eq", "$Cache-Control", "public, max-age=31536000, immutable"],
            ],
          })

          return {
            uploadUrl: presigned.url,
            fields: presigned.fields,
            publicUrl: s3.getPublicUrl({ key: objectKey }),
            key: objectKey,
          }
        },
      ),
  }),
})
