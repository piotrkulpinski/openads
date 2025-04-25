import { ChevronRightIcon, EllipsisIcon } from "lucide-react"
import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Breadcrumb = (props: ComponentProps<"nav"> & { separator?: React.ReactNode }) => (
  <nav aria-label="breadcrumb" {...props} />
)

const BreadcrumbList = ({ className, ...props }: ComponentProps<"ol">) => (
  <ol
    className={cx(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className,
    )}
    {...props}
  />
)

const BreadcrumbItem = ({ className, ...props }: ComponentProps<"li">) => (
  <li className={cx("inline-flex items-center gap-1.5", className)} {...props} />
)

const BreadcrumbLink = ({
  asChild,
  className,
  ...props
}: ComponentProps<"a"> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : "a"

  return <Comp className={cx("transition-colors hover:text-foreground", className)} {...props} />
}

const BreadcrumbPage = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    aria-disabled="true"
    aria-current="page"
    className={cx("font-normal text-foreground", className)}
    {...props}
  />
)

const BreadcrumbSeparator = ({ children, className, ...props }: ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cx("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRightIcon />}
  </li>
)

const BreadcrumbEllipsis = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cx("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <EllipsisIcon className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
