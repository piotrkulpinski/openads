import { Prisma, WorkspaceMemberRole } from "@prisma/client"
import { generateId } from "./lib/ids"

type RecordData = Record<string, any>

const allowedRoles = [WorkspaceMemberRole.Owner, WorkspaceMemberRole.Manager]

export const customIdExtension = Prisma.defineExtension({
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const record = args.data as RecordData
        record.id ||= generateId(model)
        return await query(args)
      },

      async createMany({ model, args, query }) {
        const records = (Array.isArray(args.data) ? args.data : [args.data]) as RecordData[]
        for (const record of records) {
          record.id ||= generateId(model)
        }
        return await query(args)
      },
    },
  },
})

export const modelFilterExtension = Prisma.defineExtension({
  model: {
    workspace: {
      belongsTo: (userId: string) => {
        return { members: { some: { userId, role: { in: allowedRoles } } } }
      },
    },

    spot: {
      belongsTo: (userId: string) => {
        return { workspace: { members: { some: { userId, role: { in: allowedRoles } } } } }
      },
    },
  },
})
