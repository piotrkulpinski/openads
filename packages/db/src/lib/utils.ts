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
 * Generates a prefixed unique ID for recognized models. Models absent from the
 * map (e.g. WorkspaceMember with its composite primary key) get no generated
 * id, so callers must not inject one.
 */
export const generateId = (prefix?: string) => {
  if (prefix && isKeyInObject(prefix, prefixes)) {
    return `${prefixes[prefix]}_${nanoid()}`
  }

  return undefined
}
