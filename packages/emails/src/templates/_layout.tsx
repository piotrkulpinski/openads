/** @jsxImportSource react */
import type { ReactNode } from "react"
import { Body, Container, Head, Html, Preview, Tailwind } from "react-email"

interface LayoutProps {
  preview: string
  children: ReactNode
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-neutral-900">
          <Container className="mx-auto max-w-[560px] px-6 py-10">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
