import type { AppRouter } from "@openads/api/trpc"
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

    if (!data?.fieldErrors || !Object.keys(data?.fieldErrors).length) {
      toast.error(message) // Show the error message
      form.reset() // Reset the form

      return
    }

    for (const [name, message] of Object.entries(data?.fieldErrors)) {
      form.setError(name as FieldPath<T>, { message: message?.[0] }, { shouldFocus: true })
    }
  }
}
