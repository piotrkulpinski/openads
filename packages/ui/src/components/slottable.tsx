import type { ReactNode } from "react"
import { cloneElement, isValidElement } from "react"

export type SlottableProps = {
  asChild?: boolean
  child?: ReactNode
  children: (child: ReactNode) => ReactNode
}

export const Slottable = ({ asChild, child, children, ...rest }: SlottableProps) => {
  if (!asChild) {
    return children(child)
  }

  if (!isValidElement(child)) {
    return null
  }

  // In asChild mode this element is the direct child of a radix Slot, which
  // passes the merged parent props (className, ref, handlers, ...) here in
  // `rest` — they must be forwarded onto the cloned child or the consumer's
  // element renders unstyled.
  return cloneElement(child, rest, children((child.props as { children?: ReactNode }).children))
}
