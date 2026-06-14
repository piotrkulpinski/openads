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
  CreateTier: {
    name: "Create Tier",
    channel: "tier",
  },
  SubmitAd: {
    name: "Submit Ad",
    channel: "ad",
  },
  ApproveAd: {
    name: "Approve Ad",
    channel: "ad",
  },
  RejectAd: {
    name: "Reject Ad",
    channel: "ad",
  },
  StartSubscription: {
    name: "Start Subscription",
    channel: "subscription",
  },
  CancelSubscription: {
    name: "Cancel Subscription",
    channel: "subscription",
  },
} satisfies Record<string, LogEvent>
