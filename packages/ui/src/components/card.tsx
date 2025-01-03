import type { ComponentProps } from "react"
import { cx } from "../lib/utils"

const Card = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("rounded-xl border bg-card text-card-foreground", className)} {...props} />
)

const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardTitle = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("font-semibold leading-none tracking-tight", className)} {...props} />
)

const CardDescription = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("text-sm text-muted-foreground", className)} {...props} />
)

const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("p-6 pt-0", className)} {...props} />
)

const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("flex items-center p-6 pt-0", className)} {...props} />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
