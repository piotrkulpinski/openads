import { Button } from "@openads/ui/button"
import type { ComponentProps } from "react"
import { useFormContext } from "react-hook-form"

export const FormButton = ({ ...props }: ComponentProps<typeof Button>) => {
  const { formState } = useFormContext()
  const { isSubmitting, isSubmitted, isValid } = formState

  return (
    <Button
      type="submit"
      isPending={isSubmitting}
      disabled={isSubmitting || (isSubmitted && !isValid)}
      {...props}
    />
  )
}
