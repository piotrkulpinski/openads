import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@openads/api/trpc"
import { type SpotSchema, spotSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Textarea } from "@openads/ui/textarea"
import type { NavigateOptions } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { HTMLProps } from "react"
import { useForm } from "react-hook-form"
import { FormButton } from "~/components/form-button"
import { useWorkspace } from "~/contexts/workspace-context"
import { useMutationHandler } from "~/hooks/use-mutation-handler"
import { nullsToUndefined } from "~/lib/helpers"
import { trpc } from "~/lib/trpc"
import type { RouterOutputs } from "~/lib/trpc"
import { getDefaults } from "~/lib/zod"
import type { createRouter } from "~/router"

type SpotFormProps = HTMLProps<HTMLFormElement> & {
  spot?: RouterOutputs["spot"]["getAll"][number]

  /**
   * Allows to redirect to a url after the mutation is successful
   */
  nextUrl?: NavigateOptions<ReturnType<typeof createRouter>>
}

export const SpotForm = ({ children, className, spot, nextUrl, ...props }: SpotFormProps) => {
  const utils = trpc.useUtils()
  const { id: workspaceId } = useWorkspace()
  const { handleSuccess, handleError } = useMutationHandler()
  const isEditing = !!spot?.id

  const form = useForm<SpotSchema>({
    resolver: zodResolver(spotSchema),
    values: spot ? nullsToUndefined(spot) : undefined,
    defaultValues: getDefaults(spotSchema),
  })

  const onSuccess = async () => {
    handleSuccess({
      redirect: nextUrl,
      success: `Spot ${isEditing ? "updated" : "created"} successfully`,
    })

    // Invalidate the spots cache
    await utils.spot.getAll.invalidate({ workspaceId })
    await utils.spot.getById.invalidate({ id: spot?.id, workspaceId })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createSpot = trpc.spot.create.useMutation({ onSuccess, onError })
  const updateSpot = trpc.spot.update.useMutation({ onSuccess, onError })
  const isPending = createSpot.isPending || updateSpot.isPending

  // Handle the form submission
  const onSubmit = (data: SpotSchema) => {
    if (isEditing) {
      return updateSpot.mutate({ ...data, id: spot.id, workspaceId })
    }

    return createSpot.mutate({ ...data, workspaceId })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid gap-4", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name:</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Banner Ad"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  data-1p-ignore
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description:</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="previewUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview URL:</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/banner.png" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Price:</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" min={0} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-2 col-span-full">
          {children}

          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Spot</FormButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
