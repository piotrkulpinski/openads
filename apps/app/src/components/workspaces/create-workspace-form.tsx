"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useAction } from "next-safe-action/hooks"
import type { HTMLProps } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { createWorkspaceAction } from "~/actions/workspace/create-workspace"
import { createWorkspaceSchema } from "~/schemas/workspace"

type CreateWorkspaceFormProps = HTMLProps<HTMLFormElement> & {
  onSuccess?: (data: Awaited<ReturnType<typeof createWorkspaceAction>>) => void
}

export const CreateWorkspaceForm = ({
  children,
  className,
  onSuccess,
}: CreateWorkspaceFormProps) => {
  const createWorkspace = useAction(createWorkspaceAction, { onSuccess })

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      // redirectTo: "/",
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createWorkspace.execute)}
        className={cx("space-y-4", className)}
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
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL:</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://acme.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6">
          <DialogFooter>
            <div className="space-x-4">
              <Button
                type="submit"
                className="w-full"
                isPending={createWorkspace.status === "executing"}
                disabled={createWorkspace.status === "executing"}
              >
                Create Workspace
              </Button>
            </div>
          </DialogFooter>
        </div>
      </form>
    </Form>
  )
}
