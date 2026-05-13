import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Label } from "@openads/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { Link } from "@tanstack/react-router"
import { BoxIcon, CheckIcon, CopyIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Callout, CalloutText } from "~/components/ui/callout"
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

const kindLabels: Record<SnippetKind, string> = {
  ad: "Ad placement",
  packages: "Package selector",
}

const themeLabels: Record<Theme, string> = {
  auto: "Auto (match site)",
  light: "Light",
  dark: "Dark",
}

export function EmbedSnippet({ workspaceId, zones }: EmbedSnippetProps) {
  const clipboard = useClipboard({ timeout: 2000 })
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "")
  const [theme, setTheme] = useState<Theme>("auto")
  const [kind, setKind] = useState<SnippetKind>("ad")

  const baseUrl = env.VITE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")

  const url = useMemo(() => {
    if (!zoneId) return ""
    const path = kind === "ad" ? "/embed" : "/embed/packages"
    const params = new URLSearchParams({ workspaceId, zoneId, theme })
    return `${baseUrl}${path}?${params.toString()}`
  }, [baseUrl, workspaceId, zoneId, theme, kind])

  const previewHeight = kind === "packages" ? 640 : 120

  const snippet = useMemo(() => {
    if (!url) return ""
    return `<iframe
  src="${url}"
  style="border:0;width:100%;height:${previewHeight}px"
  loading="lazy"
></iframe>`
  }, [url, previewHeight])

  if (zones.length === 0) {
    return (
      <Callout variant="warning" prefix={<BoxIcon />}>
        <CalloutText>
          No ad zones available yet.{" "}
          <Link to="/$workspaceId/zones/new" params={{ workspaceId }}>
            Create your first zone
          </Link>{" "}
          to embed it on your site.
        </CalloutText>
      </Callout>
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

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Stack direction="column" size="xs">
            <Label htmlFor="embed-zone">Zone</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger id="embed-zone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map(z => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Stack>

          <Stack direction="column" size="xs">
            <Label htmlFor="embed-type">Type</Label>
            <Select value={kind} onValueChange={v => setKind(v as SnippetKind)}>
              <SelectTrigger id="embed-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(kindLabels) as SnippetKind[]).map(k => (
                  <SelectItem key={k} value={k}>
                    {kindLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Stack>

          <Stack direction="column" size="xs">
            <Label htmlFor="embed-theme">Theme</Label>
            <Select value={theme} onValueChange={v => setTheme(v as Theme)}>
              <SelectTrigger id="embed-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map(t => (
                  <SelectItem key={t} value={t}>
                    {themeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Stack>
        </div>
      </Card.Section>

      <Card.Section theme="gray">
        <Stack direction="column" size="sm" className="w-full">
          <div className="flex w-full items-center justify-between">
            <Label>Preview</Label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {previewHeight}px tall
            </span>
          </div>

          {url ? (
            <div className="overflow-hidden rounded-md border bg-background">
              <iframe
                key={url}
                src={url}
                title="Embed preview"
                loading="lazy"
                style={{ width: "100%", height: previewHeight, border: 0 }}
              />
            </div>
          ) : (
            <div className="grid h-24 place-items-center rounded-md border border-dashed text-muted-foreground text-sm">
              Select a zone to preview.
            </div>
          )}
        </Stack>
      </Card.Section>

      <Card.Section>
        <Stack direction="column" size="sm" className="w-full">
          <Label htmlFor="embed-snippet">Embed code</Label>

          <div className="relative w-full">
            <Textarea
              id="embed-snippet"
              value={snippet}
              readOnly
              spellCheck={false}
              className="font-mono text-xs leading-relaxed break-all pr-28"
            />

            <Button
              size="sm"
              variant="secondary"
              prefix={clipboard.copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
              onClick={() => clipboard.copy(snippet)}
              disabled={!snippet}
              className="absolute top-2 right-2"
            >
              {clipboard.copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </Stack>
      </Card.Section>
    </Card>
  )
}
