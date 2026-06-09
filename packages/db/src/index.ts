import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "./env"
import { Prisma, PrismaClient } from "./generated/prisma/client"
import { customIdExtension, modelFilterExtension } from "./lib/extensions"

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
  return new PrismaClient({ adapter }).$extends(customIdExtension).$extends(modelFilterExtension)
}

declare global {
  // `var` is required to augment the global scope; `let`/`const` won't.
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export { db, Prisma }

if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = db
