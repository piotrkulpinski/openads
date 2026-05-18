;(window => {
  const document = window.document
  const currentScript = document.currentScript
  const appUrl = currentScript?.src ? new URL(currentScript.src).origin : window.location.origin
  const existing = window.OpenAds
  const queue = Array.isArray(existing?.q) ? existing.q : []

  let widget = null
  let pendingConfig = {}

  const getHeight = height => {
    if (typeof height === "number") return `${height}px`
    return height || "640px"
  }

  const getIframeUrl = options => {
    const url = new URL(`/embed/${options.slug}`, options.appUrl || appUrl)
    url.searchParams.set("theme", options.theme || "auto")
    return url.toString()
  }

  const resolveContainer = container => {
    if (!container) return null
    return typeof container === "string" ? document.querySelector(container) : container
  }

  const mount = options => {
    const container = resolveContainer(options.container)
    if (!container) {
      throw new Error("OpenAds: container is required.")
    }

    const hostElement = document.createElement("div")
    const iframe = document.createElement("iframe")

    hostElement.dataset.openadsTierSelector = "true"
    hostElement.style.width = "100%"

    iframe.title = "Advertise with us"
    iframe.loading = "lazy"
    iframe.style.cssText = `border:0;width:100%;height:${getHeight(options.height)}`
    iframe.src = getIframeUrl(options)

    hostElement.appendChild(iframe)
    container.appendChild(hostElement)

    return {
      hostElement,
      iframe,
      updateConfig(nextOptions) {
        Object.assign(options, nextOptions)
        iframe.src = getIframeUrl(options)
        iframe.style.height = getHeight(options.height)
      },
      destroy() {
        hostElement.remove()
      },
    }
  }

  const api = {
    q: [],
    init(options = {}) {
      const merged = {
        ...pendingConfig,
        ...options,
      }

      if (!merged.slug) {
        throw new Error("OpenAds: slug is required.")
      }

      if (widget) {
        widget.updateConfig(merged)
      } else {
        widget = mount(merged)
      }

      pendingConfig = {}
      return widget
    },
    updateConfig(options = {}) {
      if (!widget) {
        pendingConfig = { ...pendingConfig, ...options }
        return
      }

      widget.updateConfig(options)
    },
    destroy() {
      widget?.destroy()
      widget = null
      pendingConfig = {}
    },
  }

  window.OpenAds = api

  for (const item of queue) {
    const method = api[item.method]
    if (typeof method === "function") method(...item.args)
  }
})(window)
