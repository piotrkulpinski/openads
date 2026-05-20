import { PrismaPg } from "@prisma/adapter-pg"
import { Prisma, PrismaClient } from "./generated/prisma/client"
import { customIdExtension, modelFilterExtension } from "./lib/extensions"

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter }).$extends(customIdExtension).$extends(modelFilterExtension)
}

declare global {
  // `var` is required here: `let`/`const` can't augment the global scope in an ambient declaration.
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export { db, Prisma }

if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = db
