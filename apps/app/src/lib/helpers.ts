/**
 * Returns the favicon URL for a given website URL
 * @param url
 * @returns
 */
export const getWebsiteFavicon = (url: string): string => {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`
}
