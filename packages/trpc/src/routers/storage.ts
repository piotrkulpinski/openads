import { Buffer } from "node:buffer"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { authProcedure, router, workspaceProcedure } from "../index"

const uploadImageInput = z.object({
  key: z.string().trim().min(1, "Key is required"),
  contentType: z.string().trim().min(1, "Content type is required"),
  data: z.string().trim().min(1, "File data is required"),
  cacheControl: z.string().trim().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

const deleteObjectInput = z.object({
  key: z.string().trim().min(1, "Key is required"),
})

const deletePrefixInput = z.object({
  prefix: z.string().trim().min(1, "Prefix is required"),
})

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "")
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function ensureScopedValue(value: string, prefix: string, subject: string) {
  const trimmed = trimLeadingSlash(value)

  if (!trimmed) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `${subject} cannot be empty` })
  }

  if (trimmed.includes("..") || trimmed.includes("\\")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${subject} cannot contain traversal segments`,
    })
  }

  const candidate = trimmed.startsWith(prefix) ? trimmed : `${prefix}${trimmed}`

  if (!candidate.startsWith(prefix)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `${subject} must stay within the allowed scope (${prefix})`,
    })
  }

  return candidate
}

function decodeBase64Payload(value: string, subject: string) {
  const trimmed = value.trim()

  let payload = trimmed
  if (trimmed.startsWith("data:")) {
    const commaIndex = trimmed.indexOf(",")
    if (commaIndex === -1) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `${subject} must be a valid data URI` })
    }
    payload = trimmed.slice(commaIndex + 1)
  }

  const normalized = payload.replace(/\s+/g, "")

  if (!/^([A-Za-z0-9+/]+={0,2})$/.test(normalized)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `${subject} must be base64-encoded` })
  }

  const buffer = Buffer.from(normalized, "base64")

  if (buffer.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `${subject} payload is empty` })
  }

  return buffer
}

const userStorageRouter = router({
  uploadImage: authProcedure
    .input(uploadImageInput)
    .mutation(async ({ ctx: { s3, user }, input }) => {
      const { key, contentType, data, cacheControl, metadata } = input

      if (!contentType.toLowerCase().startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only image uploads are allowed" })
      }

      const scopedKey = ensureScopedValue(key, `users/${user.id}/`, "Object key")
      const body = decodeBase64Payload(data, "Image")

      return s3.uploadObject({
        key: scopedKey,
        body,
        contentType,
        cacheControl,
        metadata,
      })
    }),

  deleteObject: authProcedure
    .input(deleteObjectInput)
    .mutation(async ({ ctx: { s3, user }, input: { key } }) => {
      const scopedKey = ensureScopedValue(key, `users/${user.id}/`, "Object key")

      await s3.deleteObject({ key: scopedKey })

      return { success: true, key: scopedKey }
    }),

  deletePrefix: authProcedure
    .input(deletePrefixInput)
    .mutation(async ({ ctx: { s3, user }, input: { prefix } }) => {
      const scopedPrefix = ensureScopedValue(prefix, `users/${user.id}/`, "Prefix")
      const normalizedPrefix = trimTrailingSlash(scopedPrefix)

      await s3.deletePrefix({ prefix: normalizedPrefix })

      return { success: true, prefix: normalizedPrefix }
    }),
})

const workspaceStorageRouter = router({
  uploadImage: workspaceProcedure
    .input(uploadImageInput.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx: { s3, workspace }, input }) => {
      const { key, contentType, data, cacheControl, metadata } = input

      if (!contentType.toLowerCase().startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only image uploads are allowed" })
      }

      const scopedKey = ensureScopedValue(key, `workspaces/${workspace.id}/`, "Object key")
      const body = decodeBase64Payload(data, "Image")

      return s3.uploadObject({
        key: scopedKey,
        body,
        contentType,
        cacheControl,
        metadata,
      })
    }),

  deleteObject: workspaceProcedure
    .input(deleteObjectInput.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx: { s3, workspace }, input: { key } }) => {
      const scopedKey = ensureScopedValue(key, `workspaces/${workspace.id}/`, "Object key")

      await s3.deleteObject({ key: scopedKey })

      return { success: true, key: scopedKey }
    }),

  deletePrefix: workspaceProcedure
    .input(deletePrefixInput.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx: { s3, workspace }, input: { prefix } }) => {
      const scopedPrefix = ensureScopedValue(prefix, `workspaces/${workspace.id}/`, "Prefix")
      const normalizedPrefix = trimTrailingSlash(scopedPrefix)

      await s3.deletePrefix({ prefix: normalizedPrefix })

      return { success: true, prefix: normalizedPrefix }
    }),
})

export const storageRouter = router({
  user: userStorageRouter,
  workspace: workspaceStorageRouter,
})
