import type { ComponentProps } from "react"

export function Orb({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`w-[600px] h-[400px] md:w-[900px] md:h-[600px] pointer-events-none ${className}`}
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-[#10b981]/12 blur-[100px]" />
      <div className="absolute inset-[15%] rounded-full bg-[#34d399]/10 blur-[60px]" />
      <div className="absolute inset-[35%] rounded-full bg-[#6ee7b7]/8 blur-2xl" />
    </div>
  )
}
