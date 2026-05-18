import { isEmptyObject } from "@dirstack/utils"
import { ORPCError } from "@orpc/client"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

export const useMutationErrorHandler = () => {
  type HandleError<T extends FieldValues> = {
    error: unknown
    form: UseFormReturn<T>
  }

  return <T extends FieldValues>({ error, form }: HandleError<T>) => {
    const message = error instanceof Error ? error.message : "Something went wrong"

    let fieldErrors: Record<string, string[]> | undefined
    if (
      error instanceof ORPCError &&
      (error.code === "INPUT_VALIDATION_FAILED" || error.code === "CONFLICT_FIELD")
    ) {
      const data = error.data as { fieldErrors?: Record<string, string[]> } | undefined
      fieldErrors = data?.fieldErrors
    }

    if (!fieldErrors || isEmptyObject(fieldErrors)) {
      toast.error(message) // Show the error message
      form.reset() // Reset the form

      return
    }

    for (const [name, messages] of Object.entries(fieldErrors)) {
      form.setError(name as FieldPath<T>, { message: messages?.[0] }, { shouldFocus: true })
    }
  }
}
