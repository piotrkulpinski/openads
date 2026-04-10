import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"
import { customIdExtension, modelFilterExtension } from "./lib/extensions"

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter }).$extends(customIdExtension).$extends(modelFilterExtension)
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export { db }

if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = db
