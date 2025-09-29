import { isKeyInObject } from "@primoui/utils"
import { customAlphabet } from "nanoid"

/**
 * Generates a unique ID with an optional prefix and length.
 * @param prefix - The prefix to prepend to the ID.
 * @param length - The length of the ID.
 * @returns A unique ID.
 */
export const generateId = (prefix?: string, length = 21) => {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)
  const prefixes = {
    User: "usr",
    Account: "acc",
    Session: "ses",
    Verification: "ver",
    Workspace: "ws",
    Advertiser: "adv",
    Zone: "zne",
    Campaign: "cmp",
    Field: "fld",
    Subscription: "sub",
  }

  if (prefix && isKeyInObject(prefix, prefixes)) {
    return `${prefixes[prefix]}_${nanoid()}`
  }

  return nanoid()
}
