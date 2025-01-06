import type { ComponentProps } from "react"
import { cx } from "~/utils/cva"

export const LogoSymbol = ({ className, ...props }: ComponentProps<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width="40"
      height="40"
      role="img"
      aria-label="Logo"
      fill="none"
      className={cx("h-6", className)}
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20ZM9.361 11.915c-2.978 5.957-2.127 16.596 0 18.723 2.128 2.128 14.468 2.128 16.17 1.702 1.703-.425 6.383-3.404 7.234-8.085.852-4.68-1.276-15.319-4.68-17.446-3.405-2.128-14.893.85-18.724 5.106Z"
      />
    </svg>
  )
}
