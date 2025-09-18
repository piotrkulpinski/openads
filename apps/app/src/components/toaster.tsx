import { cx } from "@openads/ui/cva"
import { CircleCheckIcon, CircleHelpIcon, CircleXIcon, LoaderIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Toaster as Sonner } from "sonner"

function Toaster({ className, ...props }: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      className="pointer-events-auto"
      offset={16}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cx(
            "flex items-start gap-2 w-72 p-4 text-[13px] font-medium ring ring-background/50 rounded-lg shadow-sm",
            className,
          ),
          default: "bg-background border border-border text-foreground ring-0",
          info: "bg-foreground text-background!",
          success: "bg-green-600 text-white!",
          error: "bg-destructive text-destructive-foreground!",
          content: "w-full",
          description: "text-muted-foreground",
          icon: "mt-0.5",
        },
      }}
      icons={{
        info: <CircleHelpIcon className="size-4" />,
        success: <CircleCheckIcon className="size-4" />,
        error: <CircleXIcon className="size-4" />,
        loading: <LoaderIcon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
