import { FieldType } from "@openads/db/client"
import { BinaryIcon, LetterTextIcon, LinkIcon, ToggleLeftIcon, TypeIcon } from "lucide-react"

export const fieldsConfig = {
  icons: {
    [FieldType.Text]: TypeIcon,
    [FieldType.Textarea]: LetterTextIcon,
    [FieldType.Url]: LinkIcon,
    [FieldType.Number]: BinaryIcon,
    [FieldType.Switch]: ToggleLeftIcon,
  },
}
