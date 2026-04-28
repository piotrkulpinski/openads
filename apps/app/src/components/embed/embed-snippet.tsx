import { Button } from "@openads/ui/button"
import { Input } from "@openads/ui/input"
import { Stack } from "@openads/ui/stack"
import { CopyIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { env } from "~/env"
import type { RouterOutputs } from "~/lib/trpc"

type Zone = RouterOutputs["zone"]["getAll"][number]

type EmbedSnippetProps = {
  workspaceId: string
  zones: Zone[]
}

const themeOptions = ["auto", "light", "dark"] as const
type Theme = (typeof themeOptions)[number]

type SnippetKind = "ad" | "packages"

export function EmbedSnippet({ workspaceId, zones }: EmbedSnippetProps) {
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "")
  const [theme, setTheme] = useState<Theme>("auto")
  const [kind, setKind] = useState<SnippetKind>("ad")

  const baseUrl = env.VITE_BASE_URL || window.location.origin

  const url = useMemo(() => {
    if (!zoneId) return ""
    const path = kind === "ad" ? "/embed" : "/embed/packages"
    const params = new URLSearchParams({ workspaceId, zoneId, theme })
    return `${baseUrl}${path}?${params.toString()}`
  }, [baseUrl, workspaceId, zoneId, theme, kind])

  const snippet = useMemo(() => {
    if (!url) return ""
    return `<iframe
  src="${url}"
  style="border:0;width:100%;height:${kind === "packages" ? "640" : "120"}px"
  loading="lazy"
></iframe>`
  }, [url, kind])

  const copy = async () => {
    if (!snippet) return
    await navigator.clipboard.writeText(snippet)
    toast.success("Copied to clipboard")
  }

  if (zones.length === 0) {
    return (
      <Card>
        <Card.Section>
          <p className="text-muted-foreground text-sm">
            Create a zone first to generate embed code.
          </p>
        </Card.Section>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Section>
        <Header>
          <HeaderTitle size="h4">Snippet</HeaderTitle>
          <HeaderDescription>
            Pick a zone and an embed type, then drop the generated iframe wherever you want.
          </HeaderDescription>
        </Header>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stack direction="column" size="sm">
            <span className="text-muted-foreground text-xs uppercase">Zone</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Stack>

          <Stack direction="column" size="sm">
            <span className="text-muted-foreground text-xs uppercase">Type</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={kind}
              onChange={e => setKind(e.target.value as SnippetKind)}
            >
              <option value="ad">Ad placement</option>
              <option value="packages">Package selector</option>
            </select>
          </Stack>

          <Stack direction="column" size="sm">
            <span className="text-muted-foreground text-xs uppercase">Theme</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={theme}
              onChange={e => setTheme(e.target.value as Theme)}
            >
              {themeOptions.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Stack>
        </div>

        <Stack direction="column" size="sm" className="mt-6">
          <span className="text-muted-foreground text-xs uppercase">Snippet</span>
          <div className="flex items-start gap-2">
            <Input value={snippet} readOnly className="font-mono text-xs" />
            <Button prefix={<CopyIcon />} variant="secondary" onClick={copy} disabled={!snippet}>
              Copy
            </Button>
          </div>
        </Stack>
      </Card.Section>
    </Card>
  )
}
