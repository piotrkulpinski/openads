import { customAlphabet } from "nanoid"

export const prefixes = {
  User: "usr",
  Account: "acc",
  Session: "ses",
  Verification: "ver",
  Workspace: "ws",
  Spot: "spt",
  Booking: "bkg",
  Field: "fld",
  Subscription: "sub",
} as const

const isIn = <T extends object>(key: PropertyKey, obj: T): key is keyof T => {
  return key in obj
}

export function generateId(prefix?: string, length = 21) {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)

  if (prefix && isIn(prefix, prefixes)) {
    return `${prefixes[prefix]}_${nanoid()}`
  }

  return nanoid()
}
