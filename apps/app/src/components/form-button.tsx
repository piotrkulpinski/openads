import { Button } from "@openads/ui/button"
import type { ComponentProps } from "react"
import { useFormContext } from "react-hook-form"

export const FormButton = ({ isPending, ...props }: ComponentProps<typeof Button>) => {
  const { formState } = useFormContext()
  const { isSubmitted, isValid, isDirty } = formState

  return (
    <Button
      type="submit"
      size="lg"
      isPending={isPending}
      disabled={!isDirty || isPending || (isSubmitted && !isValid)}
      className="first:w-full"
      {...props}
    />
  )
}
