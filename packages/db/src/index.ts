import { PrismaClient } from "@prisma/client"
import { customIdExtension, workspaceFilterExtension } from "./extensions"

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(customIdExtension).$extends(workspaceFilterExtension)
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export { db }

if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = db
