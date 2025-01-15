import { zodResolver } from "@hookform/resolvers/zod"
import { spotSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Textarea } from "@openads/ui/textarea"
import type { HTMLProps } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { FormButton } from "~/components/form-button"
import { useWorkspace } from "~/contexts/workspace-context"
import { useMutationHandler } from "~/hooks/use-mutation-handler"
import { trpc } from "~/lib/trpc"
import { getDefaults } from "~/lib/zod"

export const CreateSpotForm = ({ children, className }: HTMLProps<HTMLFormElement>) => {
  const utils = trpc.useUtils()
  const workspace = useWorkspace()
  const { handleSuccess, handleError } = useMutationHandler()

  const { mutate: createSpot, isPending } = trpc.spot.create.useMutation({
    onSuccess: async () => {
      handleSuccess({
        success: "Spot successfully created",
        redirect: { to: "/$workspace/spots", params: { workspace: workspace.slug } },
      })

      // Invalidate the spots cache
      await utils.spot.getAll.invalidate()
    },

    onError: error => handleError({ error, form }),
  })

  const form = useForm<z.infer<typeof spotSchema>>({
    resolver: zodResolver(spotSchema),
    values: getDefaults(spotSchema),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data => createSpot({ ...data, workspaceId: workspace.id }))}
        className={cx("grid gap-4", className)}
        noValidate
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

          <FormButton isPending={isPending}>Create Spot</FormButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
