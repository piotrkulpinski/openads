import { isKeyInObject } from "@dirstack/utils"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789abcdefghijkmnopqrstuvwxyz", 21)

const prefixes = {
  User: "user",
  Account: "acc",
  Session: "ses",
  Verification: "ver",
  Workspace: "ws",
  Advertiser: "adv",
  Field: "fld",
  Tier: "tier",
  TierPrice: "price",
  Subscription: "sub",
  Ad: "ad",
  AdStat: "stat",
  Meta: "meta",
} as const

/**
 * Generates a unique ID, prefixed by model name when recognized.
 */
export const generateId = (prefix?: string) => {
  if (prefix && isKeyInObject(prefix, prefixes)) {
    return `${prefixes[prefix]}_${nanoid()}`
  }

  return nanoid()
}
