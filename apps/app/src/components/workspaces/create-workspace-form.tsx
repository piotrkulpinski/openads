import { slugify } from "@dirstack/utils"
import { workspaceSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useMutation } from "@tanstack/react-query"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useComputedField } from "~/hooks/use-computed-field"
import { useZodForm } from "~/hooks/use-zod-form"
import { handleMutationError } from "~/lib/handle-mutation-error"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

type CreateWorkspaceFormProps = HTMLAttributes<HTMLFormElement> & {
  /**
   * Runs after the workspace exists and the workspace list cache has been refreshed.
   */
  onSuccess?: (data: RouterOutputs["workspace"]["create"]) => void
}

export const CreateWorkspaceForm = ({
  children,
  className,
  onSuccess,
  ...props
}: CreateWorkspaceFormProps) => {
  const form = useZodForm(workspaceSchema, {
    defaultValues: {
      ...init(workspaceSchema),
    },
  })

  const onSuccessHandler = async (data: RouterOutputs["workspace"]["create"]) => {
    toast.success("Workspace created successfully")

    // Workspace menus and route loaders depend on the full workspace list.
    await queryClient.invalidateQueries({ queryKey: orpc.workspace.getAll.key() })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })

    onSuccess?.(data)
  }

  const { mutate: createWorkspace, isPending } = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: onSuccessHandler,
      onError: error => handleMutationError({ error, form }),
    }),
  )

  // Keep the editable slug in sync until the user overrides it.
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
                  // oxlint-disable-next-line jsx-a11y/no-autofocus -- dedicated create form; focusing the sole input is the expected UX
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

              <FormControl>
                <Input type="url" placeholder="https://acme.com" {...field} />
              </FormControl>

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
