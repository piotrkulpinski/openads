import { workspaceSchema } from "@openads/db/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useMutation } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { FormButton } from "~/components/form-button"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import { orpc, queryClient } from "~/lib/orpc"

export const GeneralForm = ({ ...props }: ComponentProps<"div">) => {
  const workspace = useWorkspace()
  const navigate = useNavigate()
  const router = useRouter()
  const handleError = useMutationErrorHandler()

  const form = useZodForm(workspaceSchema, {
    values: workspace,
  })

  const { mutate: updateWorkspace, isPending } = useMutation(
    orpc.workspace.update.mutationOptions({
      onSuccess: async ({ id }) => {
        if (workspace.id !== id) {
          navigate({ to: "/$workspaceId/settings/general", params: { workspaceId: id } })
        }

        toast.success("Settings updated successfully")

        // Workspace name/slug changes are visible in menus, loaders, and this settings route.
        await queryClient.invalidateQueries({ queryKey: orpc.workspace.getAll.key() })
        await queryClient.invalidateQueries({
          queryKey: orpc.workspace.getById.key({ input: { id } }),
        })

        router.invalidate()
      },

      onError: error => handleError({ error, form }),
    }),
  )

  return (
    <Card asChild {...props}>
      <form
        onSubmit={form.handleSubmit(data =>
          updateWorkspace({ ...data, workspaceId: workspace.id }),
        )}
      >
        <Form {...form}>
          <Card.Section>
            <Header>
              <HeaderTitle size="h4">Update Workspace</HeaderTitle>
              <HeaderDescription>View and update your workspace details.</HeaderDescription>
            </Header>

            <div className="grid gap-6 sm:grid-cols-2 max-w-xl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
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
            </div>
          </Card.Section>

          <Card.Row direction="rowReverse">
            <FormButton isPending={isPending}>Save Changes</FormButton>
          </Card.Row>
        </Form>
      </form>
    </Card>
  )
}
