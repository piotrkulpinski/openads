import { slugify } from "@primoui/utils"
import { z } from "zod"
import { authProcedure, router, workspaceProcedure } from "../index"

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

  return `${baseName}-${Date.now()}.${extension}`
}

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
})
