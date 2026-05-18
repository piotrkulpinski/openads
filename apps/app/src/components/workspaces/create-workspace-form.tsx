import { isValidUrl, slugify } from "@dirstack/utils"
import { workspaceSchema } from "@openads/db/schema"
import { Avatar, AvatarImage } from "@openads/ui/avatar"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Stack } from "@openads/ui/stack"
import { useMutation } from "@tanstack/react-query"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useComputedField } from "~/hooks/use-computed-field"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import { getWebsiteFavicon } from "~/lib/helpers"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

type CreateWorkspaceFormProps = HTMLAttributes<HTMLFormElement> & {
  /**
   * A callback to call when the mutation is successful
   */
  onSuccess?: (data: RouterOutputs["workspace"]["create"]) => void
}

export const CreateWorkspaceForm = ({
  children,
  className,
  onSuccess,
  ...props
}: CreateWorkspaceFormProps) => {
  const handleError = useMutationErrorHandler()

  const form = useZodForm(workspaceSchema, {
    defaultValues: {
      ...init(workspaceSchema),
    },
  })

  const onSuccessHandler = async (data: RouterOutputs["workspace"]["create"]) => {
    // Show a success toast
    toast.success("Workspace created successfully")

    // Invalidate the workspaces cache
    await queryClient.invalidateQueries({ queryKey: orpc.workspace.getAll.key() })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })

    // Call the callback if provided
    onSuccess?.(data)
  }

  const { mutate: createWorkspace, isPending } = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: onSuccessHandler,
      onError: error => handleError({ error, form }),
    }),
  )

  // Set the slug based on the name
  useComputedField({
    form,
    sourceField: "name",
    computedField: "slug",
    callback: slugify,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data => createWorkspace(data))}
        className={cx("grid gap-4 sm:grid-cols-2", className)}
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
                  autoFocus
                  placeholder="Acme Co"
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>

              <FormControl>
                <Input placeholder="acme" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Website URL</FormLabel>

              <Stack className="w-full" wrap={false}>
                <FormControl>
                  <Input type="url" placeholder="https://acme.com" {...field} />
                </FormControl>

                {isValidUrl(field.value) && (
                  <Avatar className="size-8">
                    <AvatarImage src={getWebsiteFavicon(field.value)} />
                  </Avatar>
                )}
              </Stack>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-2 col-span-full">
          {children}

          <FormButton isPending={isPending}>Create Workspace</FormButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
