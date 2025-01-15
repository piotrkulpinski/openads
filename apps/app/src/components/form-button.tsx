import { Button } from "@openads/ui/button"
import type { ComponentProps } from "react"
import { useFormContext } from "react-hook-form"

export const FormButton = ({ isPending, ...props }: ComponentProps<typeof Button>) => {
  const { formState } = useFormContext()
  const { isSubmitted, isValid } = formState

  return (
    <Button
      type="submit"
      isPending={isPending}
      disabled={isPending || (isSubmitted && !isValid)}
      {...props}
    />
  )
}
