import { Button } from "@openads/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import type { ComponentProps, HTMLAttributes, ReactNode } from "react"
import { useState } from "react"
import { z } from "zod"
import { HeaderDescription, HeaderRoot, HeaderTitle } from "~/components/ui/header"
import { useZodForm } from "~/hooks/use-zod-form"

type ConfirmModalProps = HTMLAttributes<HTMLButtonElement> &
  ComponentProps<typeof Button> & {
    label?: ReactNode
    title?: ReactNode
    description?: string
    cancelLabel?: ReactNode
    isPending?: boolean
    onConfirm: () => void
    confirmText?: string
  }

export const ConfirmModal = ({
  children,
  label = "Delete",
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently remove your data from our servers.",
  cancelLabel = "Cancel",
  variant = "destructive",
  isPending = false,
  onConfirm,
  confirmText = "",
}: ConfirmModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const form = useZodForm(z.object({ confirm: z.literal(confirmText) }), {
    defaultValues: { confirm: "" },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <Form {...form}>
        <DialogContent>
          <form onSubmit={form.handleSubmit(onConfirm)} className="flex flex-col gap-6">
            <HeaderRoot>
              <DialogTitle asChild>
                <HeaderTitle size="h4">{title}</HeaderTitle>
              </DialogTitle>

              <DialogDescription asChild>
                <HeaderDescription>{description}</HeaderDescription>
              </DialogDescription>
            </HeaderRoot>

            {!!confirmText && (
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type "{confirmText}" to confirm</FormLabel>

                    <FormControl>
                      <Input placeholder={confirmText} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="lg">
                  {cancelLabel}
                </Button>
              </DialogClose>

              <Button
                variant={variant}
                isPending={isPending}
                disabled={isPending || (!!confirmText && !form.formState.isValid)}
              >
                {label}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  )
}
