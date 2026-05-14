import { SUPPORTED_CURRENCIES } from "@openads/db/schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import type { ComponentProps } from "react"

type CurrencySelectProps = Omit<ComponentProps<typeof Select>, "children"> & {
  id?: string
}

export const CurrencySelect = ({ id, ...props }: CurrencySelectProps) => (
  <Select {...props}>
    <SelectTrigger id={id}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {SUPPORTED_CURRENCIES.map(({ code, name }) => (
        <SelectItem key={code} value={code}>
          {code.toUpperCase()} — {name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
