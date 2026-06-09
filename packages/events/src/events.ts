type LogEvent = {
  name: string
  channel: string
}

// Add new events here as `EventKey: { name, channel }` entries
export const LogEvents = {
  CreateWorkspace: {
    name: "Create Workspace",
    channel: "workspace",
  },
} satisfies Record<string, LogEvent>
