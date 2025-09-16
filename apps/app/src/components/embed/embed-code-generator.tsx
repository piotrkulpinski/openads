import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Checkbox } from "@openads/ui/checkbox"
import { Input } from "@openads/ui/input"
import { Label } from "@openads/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Textarea } from "@openads/ui/textarea"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { QueryCell } from "~/components/query-cell"
import { Stack } from "~/components/ui/stack"
import { trpc } from "~/lib/trpc"

interface Props {
  workspaceId: string
}

export function EmbedCodeGenerator({ workspaceId }: Props) {
  const clipboard = useClipboard({ timeout: 3000 })
  const [theme, setTheme] = useState("light")
  const [layout, setLayout] = useState("default")
  const [width, setWidth] = useState("100%")
  const [height, setHeight] = useState("500px")
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>([])

  const spotsQuery = trpc.spot.getAll.useQuery({ workspaceId })

  const elementId = "openads-inline"

  const embedCode = `<!-- OpenAds Embed Code -->
<div style="width:${width};height:${height};overflow:scroll" id="${elementId}"></div>
<script type="text/javascript">
  (function(O,A,L){let p=function(a,ar){a.q.push(ar);};let d=O.document;O.OpenAds=O.OpenAds||function(){if(!O._openAdsAPI){O._openAdsAPI=new OpenAdsAPI();}p(O._openAdsAPI,Array.from(arguments));};class OpenAdsAPI{constructor(){this.q=[];this.processQueue();}processQueue(){while(this.q.length>0){const args=this.q.shift();const[method,...params]=args;if(method===L){const[{workspaceId,elementOrSelector,spotIds=[],theme,layout}]=params;if(!workspaceId){console.error("OpenAds: workspaceId is required");return;}const element=typeof elementOrSelector==="string"?d.querySelector(elementOrSelector):elementOrSelector;if(!element){console.error("OpenAds: Element not found:",elementOrSelector);return;}const params=new URLSearchParams({workspaceId,spotIds:spotIds.join(","),theme,layout});const wrapper=d.createElement("div");wrapper.style.cssText="width:100%;height:100%;overflow:scroll";this.frame=d.createElement("iframe");this.frame.style.cssText="border:none;width:100%;height:100%;min-height:400px";this.frame.src=\`${window.location.origin}/embed?\${params}\`;wrapper.appendChild(this.frame);element.appendChild(wrapper);O.addEventListener("message",event=>{if(event.origin!==O.location.origin)return;if(event.data.type==="resize"&&this.frame){this.frame.style.height=\`\${event.data.height}px\`;}});}}}};})(window,"${window.location.origin}/embed.js","init");

  OpenAds("init", {
    workspaceId: "${workspaceId}",
    elementOrSelector: "#${elementId}",
    spotIds: ${JSON.stringify(selectedSpotIds)},
    theme: "${theme}",
    layout: "${layout}"
  });
</script>
<!-- OpenAds Embed Code End -->`

  const toggleSpot = (spotId: string) => {
    setSelectedSpotIds(prev =>
      prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId],
    )
  }

  return (
    <>
      <Stack size="lg" direction="column">
        <Label>Select Ad Spots</Label>

        <QueryCell
          query={spotsQuery}
          pending={() => <div className="p-4">Loading spots...</div>}
          success={({ data }) => (
            <Stack direction="column">
              {data.map(spot => (
                <div key={spot.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={spot.id}
                    checked={selectedSpotIds.includes(spot.id)}
                    onCheckedChange={() => toggleSpot(spot.id)}
                  />

                  <Label htmlFor={spot.id} className="font-normal">
                    {spot.name}
                  </Label>
                </div>
              ))}
            </Stack>
          )}
        />
      </Stack>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            name="width"
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder="e.g. 100%, 500px"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            name="height"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="e.g. 500px, auto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
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
          <Select value={layout} onValueChange={setLayout}>
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
            variant="outline"
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
