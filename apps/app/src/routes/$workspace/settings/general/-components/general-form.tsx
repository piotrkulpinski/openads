import { zodResolver } from "@hookform/resolvers/zod"
import { type WorkspaceSchema, workspaceSchema } from "@openads/db/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useNavigate, useRouter } from "@tanstack/react-router"
import type { HTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { FormButton } from "~/components/form-button"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { trpc } from "~/lib/trpc"

export const GeneralForm = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  const trpcUtils = trpc.useUtils()
  const workspace = useWorkspace()
  const navigate = useNavigate()
  const router = useRouter()
  const handleError = useMutationErrorHandler()

  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    values: workspace,
  })

  const { mutate: updateWorkspace, isPending } = trpc.workspace.update.useMutation({
    onSuccess: async ({ slug }) => {
      if (workspace.slug !== slug) {
        navigate({ to: "/$workspace/settings/general", params: { workspace: slug } })
      }

      // Show a success toast
      toast.success("Settings updated successfully")

      // Invalidate the workspace list
      await trpcUtils.workspace.getAll.invalidate()
      await trpcUtils.workspace.getBySlug.invalidate({ slug })

      // Invalidate the workspace settings
      router.invalidate()
    },

    onError: error => handleError({ error, form }),
  })

  return (
    <Card asChild {...props}>
      <form
        onSubmit={form.handleSubmit(data =>
          updateWorkspace({ ...data, workspaceId: workspace.id }),
        )}
      >
        <Form {...form}>
          <Card.Section>
            <Header
              title="Update Workspace"
              description="View and update your workspace details."
            />

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
