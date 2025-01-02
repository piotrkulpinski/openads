import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "~/utils/cva"

const alertVariants = cva({
  base: "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  variants: {
    variant: {
      default: "bg-background text-foreground",
      destructive:
        "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Alert = ({
  className,
  variant,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof alertVariants>) => (
  <div role="alert" className={cx(alertVariants({ variant }), className)} {...props} />
)

const AlertTitle = ({ className, ...props }: ComponentProps<"h5">) => (
  <h5 className={cx("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
)

const AlertDescription = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("text-sm [&_p]:leading-relaxed", className)} {...props} />
)

export { Alert, AlertTitle, AlertDescription }
