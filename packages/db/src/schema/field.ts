import { z } from "zod"
import { FieldType } from "../client"

export const fieldSchema = z.object({
  type: z.enum(FieldType).default(FieldType.Text),
  name: z.string().nonempty(),
  default: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  order: z.number().default(0),
})

export type FieldSchema = z.infer<typeof fieldSchema>
