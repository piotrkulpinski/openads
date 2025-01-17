import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@openads/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { useState } from "react"
import type { ComponentProps, HTMLAttributes, ReactNode } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Header } from "~/components/ui/header"

type DialogConfirmProps = HTMLAttributes<HTMLButtonElement> &
  ComponentProps<typeof Button> & {
    label?: ReactNode
    title?: ReactNode
    description?: string
    cancelLabel?: ReactNode
    onConfirm: () => void
    confirmText?: string
  }

export const DialogConfirm = ({
  children,
  label = "Delete",
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently remove your data from our servers.",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  confirmText,
}: DialogConfirmProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const schema = z.object({
    confirm: confirmText ? z.literal(confirmText) : z.undefined(),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const onSubmit = () => {
    setIsOpen(false)
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <Form {...form}>
        <DialogContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Header size="h4" title={title} description={description}>
              <DialogClose />
            </Header>

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

              <Button variant={variant} disabled={!form.formState.isValid}>
                {label}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  )
}
