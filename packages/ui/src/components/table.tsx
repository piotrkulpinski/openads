import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Table = ({ className, ...props }: ComponentProps<"table">) => {
  return (
    <table
      className={cx("grid grid-cols-(--table-columns) divide-y text-sm overflow-auto", className)}
      {...props}
    />
  )
}

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => {
  return (
    <thead className={cx("grid grid-cols-subgrid col-span-full divide-y", className)} {...props} />
  )
}

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => {
  return (
    <tbody className={cx("grid grid-cols-subgrid col-span-full divide-y", className)} {...props} />
  )
}

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => {
  return (
    <tr
      className={cx(
        "relative grid grid-cols-subgrid col-span-full items-center h-9 [tbody>&:not([aria-disabled])]:hover:bg-accent data-[state=selected]:bg-accent",
        className,
      )}
      {...props}
    />
  )
}

const TableHead = ({ className, ...props }: ComponentProps<"th">) => {
  return (
    <th
      className={cx("px-2 first:has-[input]:pr-0 first:not-has-[input]:pl-4 lg:px-3", className)}
      {...props}
    />
  )
}

const TableCell = ({ className, ...props }: ComponentProps<"td">) => {
  return (
    <td
      className={cx("px-2 first:has-[input]:pr-0 first:not-has-[input]:pl-4 lg:px-3", className)}
      {...props}
    />
  )
}

const TableCaption = ({ className, ...props }: ComponentProps<"caption">) => {
  return <caption className={cx("mt-4 text-sm text-muted-foreground", className)} {...props} />
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption }
