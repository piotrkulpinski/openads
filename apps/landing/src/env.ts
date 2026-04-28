import { env as emails } from "@openads/emails/env"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  extends: [emails],

  server: {
    AUTOSEND_WAITLIST_LIST_ID: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
