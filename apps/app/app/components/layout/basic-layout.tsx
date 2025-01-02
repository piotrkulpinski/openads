import type { PropsWithChildren } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type BasicLayoutProps = PropsWithChildren<{
  title: string
  description?: string
}>

export const BasicLayout = ({ children, title, description }: BasicLayoutProps) => {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}
