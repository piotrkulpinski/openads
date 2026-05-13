import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Label } from "@openads/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useMemo } from "react"
import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { env } from "~/env"

interface EmbedSnippetProps {
  workspaceId: string
}

const themeOptions = ["auto", "light", "dark"] as const
type Theme = (typeof themeOptions)[number]

const themeLabels: Record<Theme, string> = {
  auto: "Auto (match site)",
  light: "Light",
  dark: "Dark",
}

const PREVIEW_HEIGHT = 640

export function EmbedSnippet({ workspaceId }: EmbedSnippetProps) {
  const clipboard = useClipboard({ timeout: 2000 })
  const [theme, setTheme] = useState<Theme>("auto")

  const baseUrl = env.VITE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")

  const url = useMemo(() => {
    const params = new URLSearchParams({ workspaceId, theme })
    return `${baseUrl}/embed?${params.toString()}`
  }, [baseUrl, workspaceId, theme])

  const snippet = useMemo(() => {
    if (!url) return ""
    return `<iframe
  src="${url}"
  style="border:0;width:100%;height:${PREVIEW_HEIGHT}px"
  loading="lazy"
></iframe>`
  }, [url])

  return (
    <Card>
      <Card.Section>
        <Header gap="sm" className="mb-4">
          <HeaderTitle size="h4">Package selector</HeaderTitle>
          <HeaderDescription size="sm">
            Drop this iframe onto your site so visitors can subscribe to one of your advertising
            packages. Payment runs through Stripe; once paid, the advertiser fills in the creative
            and the ad enters the review queue.
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
          <Label htmlFor="embed-snippet">Embed code</Label>

          <div className="relative w-full">
            <Textarea
              id="embed-snippet"
              value={snippet}
              readOnly
              spellCheck={false}
              className="break-all pr-28 font-mono text-xs leading-relaxed"
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
