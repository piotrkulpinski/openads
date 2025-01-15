import { publishEscape } from "@curiousleaf/utils"
import type { AppRouter } from "@openads/api/trpc"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import type { createRouter } from "~/router"

type RedirectOptions = NavigateOptions<ReturnType<typeof createRouter>>

export const useMutationHandler = () => {
  const navigate = useNavigate()

  type HandleSuccess = {
    redirect?: RedirectOptions
    close?: boolean
    success?: string
    error?: string
  }

  const handleSuccess = ({ redirect, close, success, error }: HandleSuccess) => {
    // If we have a redirect, navigate to it
    redirect && navigate(redirect)

    // If closing panels, trigger escape
    close && publishEscape()

    // If we have a success message, show it
    success && toast.success(success)

    // If we have an error message, show it
    error && toast.error(error)
  }

  type HandleError<T extends FieldValues> = {
    error: TRPCClientErrorLike<AppRouter>
    form: UseFormReturn<T>
  }

  const handleError = <T extends FieldValues>({ error, form }: HandleError<T>) => {
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

  return { handleSuccess, handleError }
}
