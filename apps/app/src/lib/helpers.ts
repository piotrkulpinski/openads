export const getWebsiteFavicon = (url: string): string =>
  `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`
