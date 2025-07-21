import { zodResolver } from "@hookform/resolvers/zod"
import { type WorkspaceSchema, workspaceSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { slugify } from "@primoui/utils"
import type { HTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { FormButton } from "~/components/form-button"
import { useComputedField } from "~/hooks/use-computed-field"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { type RouterOutputs, trpc } from "~/lib/trpc"

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
  const utils = trpc.useUtils()
  const handleError = useMutationErrorHandler()

  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      websiteUrl: "",
    },
  })

  const { mutate: createWorkspace, isPending } = trpc.workspace.create.useMutation({
    onSuccess: async data => {
      onSuccess?.(data)

      // Invalidate the workspaces cache
      await utils.workspace.getAll.invalidate()
    },

    onError: error => handleError({ error, form }),
  })

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
