import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import type { ComponentProps } from "react"
import { Button, type ButtonProps } from "~/components/ui/button"
import { cx } from "~/utils/cva"

const Pagination = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cx("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)

const PaginationContent = ({ className, ...props }: ComponentProps<"ul">) => (
  <ul className={cx("flex flex-row items-center gap-1", className)} {...props} />
)

const PaginationItem = ({ className, ...props }: ComponentProps<"li">) => (
  <li className={cx("", className)} {...props} />
)

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size" | "prefix"> &
  Omit<ComponentProps<"a">, "prefix">

const PaginationLink = ({
  className,
  isActive,
  prefix,
  size = "sm",
  ...props
}: PaginationLinkProps) => (
  <Button variant={isActive ? "outline" : "ghost"} size={size} prefix={prefix} asChild>
    <a aria-current={isActive ? "page" : undefined} {...props} />
  </Button>
)

const PaginationPrevious = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cx("gap-1 pl-2.5", className)}
    prefix={<ChevronLeftIcon className="size-4" />}
    {...props}
  />
)

const PaginationNext = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cx("gap-1 pr-2.5", className)}
    prefix={<ChevronRightIcon className="size-4" />}
    {...props}
  />
)

const PaginationEllipsis = ({ className, ...props }: ComponentProps<"span">) => (
  <span aria-hidden className={cx("flex size-9 items-center justify-center", className)} {...props}>
    <DotsHorizontalIcon className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
