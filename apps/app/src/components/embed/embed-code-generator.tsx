import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Checkbox } from "@openads/ui/checkbox"
import { Input } from "@openads/ui/input"
import { Label } from "@openads/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { slugify } from "@primoui/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { siteConfig } from "~/config/site"
import { useWorkspace } from "~/contexts/workspace-context"
import type { RouterOutputs } from "~/lib/trpc"

type EmbedCodeGeneratorProps = {
  zones: RouterOutputs["zone"]["getAll"]
}

type EmbedOptions = {
  width: string
  height: string
  theme: "light" | "dark"
  layout: "default" | "grid"
  zones: string[]
}

export function EmbedCodeGenerator({ zones }: EmbedCodeGeneratorProps) {
  const clipboard = useClipboard({ timeout: 3000 })
  const workspace = useWorkspace()
  const [options, setOptions] = useState<EmbedOptions>({
    width: "100%",
    height: "500px",
    theme: "light",
    layout: "default",
    zones: zones.map(zone => zone.id),
  })

  const elementId = `${slugify(siteConfig.name)}-widget`

  const embedCode = `<!-- OpenAds Embed Code -->
<div style="width:${options.width};height:${options.height};overflow:scroll" id="${elementId}"></div>
<script type="text/javascript">
  (function(O,A,L){let p=function(a,ar){a.q.push(ar);};let d=O.document;O.OpenAds=O.OpenAds||function(){if(!O._openAdsAPI){O._openAdsAPI=new OpenAdsAPI();}p(O._openAdsAPI,Array.from(arguments));};class OpenAdsAPI{constructor(){this.q=[];this.processQueue();}processQueue(){while(this.q.length>0){const args=this.q.shift();const[method,...params]=args;if(method===L){const[{workspace,elementOrSelector,zones=[],theme,layout}]=params;if(!workspace){console.error("OpenAds: workspace is required");return;}const element=typeof elementOrSelector==="string"?d.querySelector(elementOrSelector):elementOrSelector;if(!element){console.error("OpenAds: Element not found:",elementOrSelector);return;}const params=new URLSearchParams({workspace,zones:zones.join(","),theme,layout});const wrapper=d.createElement("div");wrapper.style.cssText="width:100%;height:100%;overflow:scroll";this.frame=d.createElement("iframe");this.frame.style.cssText="border:none;width:100%;height:100%;min-height:400px";this.frame.src=\`${window.location.origin}/embed?\${params}\`;wrapper.appendChild(this.frame);element.appendChild(wrapper);O.addEventListener("message",event=>{if(event.origin!==O.location.origin)return;if(event.data.type==="resize"&&this.frame){this.frame.style.height=\`\${event.data.height}px\`;}});}}}};})(window,"${window.location.origin}/embed.js","init");

  OpenAds("init", {
    elementOrSelector: "#${elementId}",
    workspace: "${workspace.id}",
    zones: ${JSON.stringify(options.zones)},
    theme: "${options.theme}",
    layout: "${options.layout}"
  });
</script>
<!-- OpenAds Embed Code End -->`

  const onParamChange = (key: keyof EmbedOptions, value: string | string[]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  if (zones.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No ad zones available yet. Create a zone to embed it here.
      </div>
    )
  }

  return (
    <>
      <Stack size="lg" direction="column">
        <Label>Select Ad Zones</Label>

        <Stack direction="column">
          {zones.map(({ id, name }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={options.zones.includes(id)}
                onCheckedChange={() =>
                  onParamChange(
                    "zones",
                    options.zones.includes(id)
                      ? options.zones.filter(z => z !== id)
                      : [...options.zones, id],
                  )
                }
              />

              <Label htmlFor={id} className="font-normal">
                {name}
              </Label>
            </div>
          ))}
        </Stack>
      </Stack>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            name="width"
            value={options.width}
            onChange={e => onParamChange("width", e.target.value)}
            placeholder="e.g. 100%, 500px"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            name="height"
            value={options.height}
            onChange={e => onParamChange("height", e.target.value)}
            placeholder="e.g. 500px, auto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={options.theme} onValueChange={value => onParamChange("theme", value)}>
            <SelectTrigger name="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="layout">Layout</Label>
          <Select value={options.layout} onValueChange={value => onParamChange("layout", value)}>
            <SelectTrigger name="layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Embed Code</Label>

          <Button
            size="sm"
            variant="secondary"
            prefix={
              clipboard.copied ? (
                <CheckIcon className="text-green-500" />
              ) : (
                <CopyIcon className="" />
              )
            }
            onClick={() => clipboard.copy(embedCode)}
          >
            {clipboard.copied ? "Copied" : "Copy Code"}
          </Button>
        </div>

        <Textarea value={embedCode} readOnly className="font-mono text-sm w-full break-all" />
      </div>
    </>
  )
}
