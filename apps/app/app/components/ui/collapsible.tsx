"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import type { ComponentProps } from "react"

const Collapsible = (props: ComponentProps<typeof CollapsiblePrimitive.Root>) => (
  <CollapsiblePrimitive.Root {...props} />
)

const CollapsibleTrigger = (
  props: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>,
) => <CollapsiblePrimitive.CollapsibleTrigger {...props} />

const CollapsibleContent = (
  props: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>,
) => <CollapsiblePrimitive.CollapsibleContent {...props} />

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
