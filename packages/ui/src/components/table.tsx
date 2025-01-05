import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <div className="relative w-full overflow-auto">
    <table className={cx("w-full caption-bottom text-sm", className)} {...props} />
  </div>
)

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => (
  <thead className={cx("[&_tr]:border-b", className)} {...props} />
)

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => (
  <tbody className={cx("[&_tr:last-child]:border-0", className)} {...props} />
)

const TableFooter = ({ className, ...props }: ComponentProps<"tfoot">) => (
  <tfoot
    className={cx("border-t bg-card font-medium last:[&>tr]:border-b-0", className)}
    {...props}
  />
)

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr
    className={cx(
      "border-b transition-colors hover:bg-card data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
)

const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
  <th
    className={cx(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
)

const TableCell = ({ className, ...props }: ComponentProps<"td">) => (
  <td
    className={cx(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
)

const TableCaption = ({ className, ...props }: ComponentProps<"caption">) => (
  <caption className={cx("mt-4 text-sm text-muted-foreground", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
