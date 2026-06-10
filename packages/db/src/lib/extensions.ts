import { Prisma } from "../generated/prisma/client"
import { WorkspaceMemberRole } from "../generated/prisma/enums"
import { generateId } from "./utils"

type RecordData = Record<string, unknown>

const allowedRoles = [WorkspaceMemberRole.Owner, WorkspaceMemberRole.Manager]

export const customIdExtension = Prisma.defineExtension({
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const record = args.data as RecordData
        const id = record.id || generateId(model)
        if (id) record.id = id
        return await query(args)
      },

      async createMany({ model, args, query }) {
        const records = (Array.isArray(args.data) ? args.data : [args.data]) as RecordData[]
        for (const record of records) {
          const id = record.id || generateId(model)
          if (id) record.id = id
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
  },
})
