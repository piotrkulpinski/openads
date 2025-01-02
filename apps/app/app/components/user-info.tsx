"use client"

import { getInitials } from "@curiousleaf/utils"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useSession } from "~/lib/auth.client"

export const UserInfo = () => {
  const { data } = useSession()

  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={data?.user?.image ?? ""} alt={data?.user?.name ?? ""} />
        <AvatarFallback className="rounded-lg">{getInitials(data?.user?.name)}</AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{data?.user?.name}</span>
        <span className="truncate text-xs">{data?.user?.email}</span>
      </div>
    </>
  )
}
