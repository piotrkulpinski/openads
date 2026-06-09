import { Button } from "@openads/ui/button"
import type { ComponentProps } from "react"

export const FormButton = ({ isPending, ...props }: ComponentProps<typeof Button>) => {
  return <Button type="submit" isPending={isPending} className="first:not-only:w-full" {...props} />
}
