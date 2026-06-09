import { isEmptyObject } from "@dirstack/utils"
import { ORPCError } from "@orpc/client"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

type HandleMutationError<T extends FieldValues> = {
  error: unknown
  form: UseFormReturn<T>
}

export const handleMutationError = <T extends FieldValues>({
  error,
  form,
}: HandleMutationError<T>) => {
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
    toast.error(message)
    // Non-field errors leave no reliable target for inline form feedback.
    form.reset()

    return
  }

  for (const [name, messages] of Object.entries(fieldErrors)) {
    form.setError(name as FieldPath<T>, { message: messages?.[0] }, { shouldFocus: true })
  }
}
