import type { ReactNode } from "react"
import { cloneElement, isValidElement } from "react"

export type SlottableProps = {
  asChild?: boolean
  child?: ReactNode
  children: (child: ReactNode) => ReactNode
}

export const Slottable = (props: SlottableProps) => {
  const { asChild, child, children, ...rest } = props

  if (!asChild) {
    return children(child)
  }

  if (!isValidElement(child)) {
    return null
  }

  // @ts-expect-error
  return cloneElement(child, { ref, ...rest }, children(child.props?.children))
}
