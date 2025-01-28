import { FieldType } from "@openads/db/client"
import { z } from "zod"

export const fieldSchema = z.object({
  type: z.nativeEnum(FieldType),
  name: z.string(),
  default: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional(),
  order: z.number().optional(),
})

export type FieldSchema = z.infer<typeof fieldSchema>
