;((O, A, L) => {
  const APP_URL = "http://localhost:5183"

  const p = (api, args) => api.q.push(args)
  const d = O.document

  class OpenAdsAPI {
    constructor() {
      this.q = []
      this.processQueue()
    }

    processQueue() {
      while (this.q.length > 0) {
        const args = this.q.shift()
        const [method, ...params] = args

        if (method === L) {
          const [{ workspaceId, elementOrSelector, zoneIds = [], ...config }] = params

          if (!workspaceId) {
            console.error("OpenAds: workspaceId is required")
            return
          }

          const element =
            typeof elementOrSelector === "string"
              ? d.querySelector(elementOrSelector)
              : elementOrSelector

          if (!element) {
            console.error("OpenAds: Element not found:", elementOrSelector)
            return
          }

          const params = new URLSearchParams({
            workspaceId,
            zoneIds: zoneIds.join(","),
            ...config,
          })

          const wrapper = d.createElement("div")
          wrapper.style.cssText = "width:100%;height:100%;overflow:scroll"

          this.frame = d.createElement("iframe")
          this.frame.style.cssText = "border:none;width:100%;height:100%;min-height:400px"
          this.frame.src = `${APP_URL}/embed?${params}`

          wrapper.appendChild(this.frame)
          element.appendChild(wrapper)

          O.addEventListener("message", event => {
            if (event.origin !== APP_URL) return
            if (event.data.type === "resize" && this.frame) {
              this.frame.style.height = `${event.data.height}px`
            }
          })
        }
      }
    }
  }

  O.OpenAds =
    O.OpenAds ||
    (() => {
      if (!O._openAdsAPI) {
        O._openAdsAPI = new OpenAdsAPI()
      }
      p(O._openAdsAPI, Array.from(arguments))
    })
})(window, `${window.location.origin}/embed.js`, "init")
