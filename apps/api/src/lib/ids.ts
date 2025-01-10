import { customAlphabet } from "nanoid"

export const prefixes = {
  user: "usr",
  account: "acc",
  session: "ses",
  verification: "ver",
  workspace: "ws",
  spot: "spt",
  booking: "bkg",
  field: "fld",
  subscription: "sub",
} as const

export function generateId<TPrefix extends keyof typeof prefixes>(prefix?: TPrefix, length = 21) {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)

  return `${prefix ? `${prefixes[prefix]}_` : ""}${nanoid()}`
}
