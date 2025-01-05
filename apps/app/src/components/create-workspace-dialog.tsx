"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@openads/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useAction } from "next-safe-action/hooks"
import { type PropsWithChildren, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { createWorkspaceAction } from "~/actions/create-workspace-action"
import { createWorkspaceSchema } from "~/schemas/workspace"

export const CreateWorkspaceDialog = ({ children }: PropsWithChildren) => {
  const [isOpen, onOpenChange] = useState(false)

  const createWorkspace = useAction(createWorkspaceAction, {
    onSuccess: () => onOpenChange(false),
  })

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      // redirectTo: "/",
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[455px]">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            For example, you can use the name of your company or department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createWorkspace.execute)}
            className="space-y-4"
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
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    isPending={createWorkspace.status === "executing"}
                    disabled={createWorkspace.status === "executing"}
                  >
                    Continue
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
