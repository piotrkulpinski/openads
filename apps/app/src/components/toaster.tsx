import type { ComponentProps } from "react"
import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      className="bg-background text-foreground shadow-lg select-none"
      closeButton
      toastOptions={{
        classNames: {
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
