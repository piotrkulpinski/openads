import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Label } from "@openads/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { env } from "~/env"

type EmbedSnippetProps = {
  slug: string
}

const themeOptions = ["auto", "light", "dark"] as const
type Theme = (typeof themeOptions)[number]

const themeLabels: Record<Theme, string> = {
  auto: "Auto (match site)",
  light: "Light",
  dark: "Dark",
}

const PREVIEW_HEIGHT = 640

export const EmbedSnippet = ({ slug }: EmbedSnippetProps) => {
  const clipboard = useClipboard({ timeout: 2000 })
  const [theme, setTheme] = useState<Theme>("auto")
  const [copiedSnippet, setCopiedSnippet] = useState("")

  const baseUrl = env.VITE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")
  const apiUrl = env.VITE_API_URL

  const url = `${baseUrl}/embed/${slug}?${new URLSearchParams({ theme })}`

  const iframeSnippet = `<iframe
  src="${url}"
  style="border:0;width:100%;height:${PREVIEW_HEIGHT}px"
  loading="lazy"
></iframe>`

  const scriptSnippet = `<div id="openads-advertise"></div>
<script>
  window.OpenAds = window.OpenAds || {
    q: [],
    init(...args) { this.q.push({ method: "init", args }) },
    updateConfig(...args) { this.q.push({ method: "updateConfig", args }) },
    destroy(...args) { this.q.push({ method: "destroy", args }) },
  }
  window.OpenAds.init({
    slug: "${slug}",
    container: "#openads-advertise",
    theme: "${theme}",
  })
</script>
<script async src="${baseUrl}/embed.js"></script>`

  const serverSnippet = `import { createOpenAdsClient } from "@openads/sdk"

const openads = createOpenAdsClient({
  workspaceSlug: "${slug}",
  apiUrl: "${apiUrl}",
})

export const AdSlot = async () => {
  const ad = await openads.getAd({
    weightGte: 2.5,
    request: { cache: "no-store" },
  })

  if (!ad) return null

  return (
    <a href={ad.websiteUrl}>
      {ad.name}
    </a>
  )
}`

  const reactSnippet = `import { OpenAdsProvider, useOpenAdsAd, useOpenAdsTracking } from "@openads/react"

const AdSlot = () => {
  const { data: ad } = useOpenAdsAd({ weightGte: 2.5 })
  const { impressionRef, getClickProps } = useOpenAdsTracking(ad)

  if (!ad) return null

  return (
    <a ref={impressionRef} href={ad.websiteUrl} {...getClickProps()}>
      {ad.name}
    </a>
  )
}

export const Ads = () => (
  <OpenAdsProvider workspaceSlug="${slug}" apiUrl="${apiUrl}">
    <AdSlot />
  </OpenAdsProvider>
)`

  const copySnippet = (id: string, value: string) => {
    setCopiedSnippet(id)
    clipboard.copy(value)
  }

  return (
    <Card>
      <Card.Section>
        <Header gap="sm" className="mb-4">
          <HeaderTitle size="h4">Tier selector</HeaderTitle>
          <HeaderDescription size="sm">
            Drop this iframe onto your site so visitors can subscribe to one of your advertising
            tiers. Payment runs through Stripe; once paid, the advertiser fills in the creative and
            the ad enters the review queue.
          </HeaderDescription>
        </Header>

        <div className="grid gap-4 sm:max-w-xs">
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
              {PREVIEW_HEIGHT}px tall
            </span>
          </div>

          <div className="overflow-hidden rounded-md border bg-background">
            <iframe
              key={url}
              src={url}
              title="Embed preview"
              loading="lazy"
              style={{ width: "100%", height: PREVIEW_HEIGHT, border: 0 }}
            />
          </div>
        </Stack>
      </Card.Section>

      <Card.Section>
        <Stack direction="column" size="sm" className="w-full">
          <SnippetBlock
            id="embed-iframe-snippet"
            label="Iframe embed"
            value={iframeSnippet}
            copied={clipboard.copied && copiedSnippet === "iframe"}
            onCopy={() => copySnippet("iframe", iframeSnippet)}
          />

          <SnippetBlock
            id="embed-script-snippet"
            label="Script embed"
            value={scriptSnippet}
            copied={clipboard.copied && copiedSnippet === "script"}
            onCopy={() => copySnippet("script", scriptSnippet)}
          />

          <SnippetBlock
            id="sdk-server-snippet"
            label="Server-side ad fetching"
            value={serverSnippet}
            copied={clipboard.copied && copiedSnippet === "server"}
            onCopy={() => copySnippet("server", serverSnippet)}
          />

          <SnippetBlock
            id="react-tracking-snippet"
            label="React fetching and tracking"
            value={reactSnippet}
            copied={clipboard.copied && copiedSnippet === "react"}
            onCopy={() => copySnippet("react", reactSnippet)}
          />
        </Stack>
      </Card.Section>
    </Card>
  )
}

type SnippetBlockProps = {
  id: string
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}

const SnippetBlock = ({ id, label, value, copied, onCopy }: SnippetBlockProps) => {
  return (
    <Stack direction="column" size="sm" className="w-full">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative w-full">
        <Textarea
          id={id}
          value={value}
          readOnly
          spellCheck={false}
          className="min-h-36 break-all pr-28 font-mono text-xs leading-relaxed"
        />

        <Button
          size="sm"
          variant="secondary"
          prefix={copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
          onClick={onCopy}
          disabled={!value}
          className="absolute top-2 right-2"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Stack>
  )
}
