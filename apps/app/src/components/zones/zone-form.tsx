import { type ZoneSchema, zoneSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { Tooltip } from "@openads/ui/tooltip"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import { HelpCircleIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"
import type { router } from "~/main"

type ZoneFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string

  /**
   * The zone to edit
   */
  zone?: RouterOutputs["zone"]["getAll"][number]

  /**
   * Allows to redirect to a url after the mutation is successful
   */
  nextUrl?: NavigateOptions<typeof router>

  /**
   * A callback to call when the mutation is successful
   */
  onSuccess?: (data: RouterOutputs["zone"]["create"]) => void
}

export const ZoneForm = ({
  children,
  className,
  workspaceId,
  zone,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: ZoneFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!zone?.id

  const form = useZodForm(zoneSchema, {
    defaultValues: {
      ...init(zoneSchema),
      ...zone,
    },
  })

  const onSuccess = async (data: RouterOutputs["zone"]["create"]) => {
    // If we have a nextUrl, navigate to it
    nextUrl && navigate(nextUrl)

    // Show a success toast
    toast.success(`Zone ${isEditing ? "updated" : "created"} successfully`)

    // Invalidate the zones cache
    await utils.zone.getAll.invalidate({ workspaceId })
    await utils.zone.getById.invalidate({ id: zone?.id, workspaceId })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })

    // Call the callback if provided
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createZone = trpc.zone.create.useMutation({ onSuccess, onError })
  const updateZone = trpc.zone.update.useMutation({ onSuccess, onError })
  const isPending = createZone.isPending || updateZone.isPending

  // Handle the form submission
  const onSubmit = (data: ZoneSchema) => {
    if (isEditing) {
      return updateZone.mutate({ ...data, id: zone.id, workspaceId })
    }

    return createZone.mutate({ ...data, workspaceId })
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoFocus={!isEditing}
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
              <FormLabel>Description</FormLabel>
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
              <Stack size="xs">
                <FormLabel>Preview URL</FormLabel>

                <Tooltip tooltip="This is a tooltip">
                  <HelpCircleIcon className="size-4 text-muted-foreground" />
                </Tooltip>
              </Stack>

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
          render={({ field: { onChange, ...field } }) => (
            <FormItem className="col-span-full">
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
                  min={0}
                  onChange={e => onChange?.(Number.parseInt(e.target.value, 10))}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-2 col-span-full">
          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Zone</FormButton>
          {children}
        </DialogFooter>
      </form>
    </Form>
  )
}
