import type { ReactNode } from "react"
import { cloneElement, isValidElement } from "react"

export type SlottableProps = {
  asChild?: boolean
  child?: ReactNode
  children: (child: ReactNode) => ReactNode
}

export const Slottable = ({ asChild, child, children }: SlottableProps) => {
  if (!asChild) {
    return children(child)
  }

  if (!isValidElement(child)) {
    return null
  }

  return cloneElement(
    child,
    undefined,
    children((child.props as { children?: ReactNode }).children),
  )
}
