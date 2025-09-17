import { z } from "zod"
import { FieldType } from "../client"

export const fieldSchema = z.object({
  type: z.enum(FieldType),
  name: z.string(),
  default: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional(),
  order: z.number().optional(),
})

export type FieldSchema = z.infer<typeof fieldSchema>
