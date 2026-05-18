export type OpenAdsBrowserContainer = string | Element

export type OpenAdsBrowserTheme = "auto" | "light" | "dark"

export type OpenAdsTierSelectorOptions = {
  slug: string
  container: OpenAdsBrowserContainer
  appUrl?: string
  theme?: OpenAdsBrowserTheme
  height?: number | string
}

export type OpenAdsTierSelector = {
  hostElement: HTMLDivElement
  iframe: HTMLIFrameElement
  updateConfig: (options: Partial<OpenAdsTierSelectorOptions>) => void
  destroy: () => void
}

const DEFAULT_APP_URL = "https://app.openads.co"
const DEFAULT_HEIGHT = 640

const resolveContainer = (container: OpenAdsBrowserContainer): Element => {
  if (typeof container !== "string") return container

  const element = document.querySelector(container)
  if (!element) {
    throw new Error(`OpenAds could not find a container matching "${container}".`)
  }

  return element
}

const getHeight = (height: number | string | undefined): string => {
  if (typeof height === "number") return `${height}px`
  return height ?? `${DEFAULT_HEIGHT}px`
}

const getIframeUrl = ({
  appUrl = DEFAULT_APP_URL,
  slug,
  theme = "auto",
}: OpenAdsTierSelectorOptions): string => {
  const url = new URL(`/embed/${slug}`, appUrl)
  url.searchParams.set("theme", theme)
  return url.toString()
}

export const mountTierSelector = (options: OpenAdsTierSelectorOptions): OpenAdsTierSelector => {
  if (typeof document === "undefined") {
    throw new Error("mountTierSelector can only run in a browser environment.")
  }

  let currentOptions = options
  const container = resolveContainer(options.container)
  const hostElement = document.createElement("div")
  const iframe = document.createElement("iframe")

  hostElement.dataset.openadsTierSelector = "true"
  hostElement.style.width = "100%"

  iframe.title = "Advertise with us"
  iframe.loading = "lazy"
  iframe.style.border = "0"
  iframe.style.width = "100%"
  iframe.style.height = getHeight(options.height)
  iframe.src = getIframeUrl(options)

  hostElement.appendChild(iframe)
  container.appendChild(hostElement)

  const updateConfig = (nextOptions: Partial<OpenAdsTierSelectorOptions>) => {
    currentOptions = { ...currentOptions, ...nextOptions }
    iframe.src = getIframeUrl(currentOptions)
    iframe.style.height = getHeight(currentOptions.height)
  }

  const destroy = () => {
    hostElement.remove()
  }

  return { hostElement, iframe, updateConfig, destroy }
}
