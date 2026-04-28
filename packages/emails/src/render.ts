import type { ReactElement } from "react"
import { render as renderEmail } from "react-email"

export interface RenderResult {
  html: string
  text: string
}

export async function renderTemplate(node: ReactElement): Promise<RenderResult> {
  const [html, text] = await Promise.all([
    renderEmail(node, { pretty: true }),
    renderEmail(node, { plainText: true }),
  ])

  return { html, text }
}
