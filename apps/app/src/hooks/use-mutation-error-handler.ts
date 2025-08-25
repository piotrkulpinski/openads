import type { AppRouter } from "@openads/trpc/router"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

export const useMutationErrorHandler = () => {
  type HandleError<T extends FieldValues> = {
    error: TRPCClientErrorLike<AppRouter>
    form: UseFormReturn<T>
  }

  return <T extends FieldValues>({ error, form }: HandleError<T>) => {
    const { data, message } = error

    // Type the data properly to avoid TypeScript errors
    const fieldErrors = data?.fieldErrors as Record<string, string[]> | undefined

    if (!fieldErrors || !Object.keys(fieldErrors).length) {
      toast.error(message) // Show the error message
      form.reset() // Reset the form

      return
    }

    for (const [name, messages] of Object.entries(fieldErrors)) {
      form.setError(name as FieldPath<T>, { message: messages?.[0] }, { shouldFocus: true })
    }
  }
}
