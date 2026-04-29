import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { ExternalLinkIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { z } from "zod"
import { type RouterOutputs, trpc } from "~/lib/trpc"

const defaultValues = {
  workspaceId: "",
  zoneId: "",
  theme: "auto",
} as const

export const Route = createFileRoute("/embed/")({
  validateSearch: z.object({
    workspaceId: z.string().default(defaultValues.workspaceId),
    zoneId: z.string().default(defaultValues.zoneId),
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: AdEmbed,
})

function AdEmbed() {
  const { workspaceId, zoneId, theme } = Route.useSearch()

  const adQuery = trpc.ad.public.getForPlacement.useQuery(
    { workspaceId, zoneId },
    { enabled: !!workspaceId && !!zoneId, refetchOnWindowFocus: false },
  )

  if (!workspaceId || !zoneId) {
    return <Centered>Missing search param.</Centered>
  }

  if (adQuery.isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!adQuery.data) {
    return <FallbackPromo workspaceId={workspaceId} zoneId={zoneId} />
  }

  return <AdCard ad={adQuery.data} theme={theme} />
}

type Ad = NonNullable<RouterOutputs["ad"]["public"]["getForPlacement"]>

function AdCard({ ad, theme }: { ad: Ad; theme: "auto" | "light" | "dark" }) {
  const ref = useRef<HTMLAnchorElement | null>(null)
  const impressionFired = useRef(false)
  const recordImpression = trpc.ad.public.recordImpression.useMutation()
  const recordClick = trpc.ad.public.recordClick.useMutation()

  useEffect(() => {
    if (!ref.current) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !impressionFired.current) {
          timer = setTimeout(() => {
            if (impressionFired.current) return
            impressionFired.current = true
            recordImpression.mutate({ adId: ad.id })
          }, 500)
        } else if (timer) {
          clearTimeout(timer)
          timer = null
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [ad.id, recordImpression])

  const onClick = () => {
    recordClick.mutate({ adId: ad.id })
  }

  const isDark = theme === "dark"

  return (
    <a
      ref={ref}
      href={ad.websiteUrl}
      target="_blank"
      rel="noreferrer sponsored"
      onClick={onClick}
      className={
        isDark
          ? "block rounded-lg border border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-700"
          : "block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300"
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        {ad.faviconUrl ? (
          <img alt="" src={ad.faviconUrl} className="size-10 rounded" />
        ) : (
          <div
            className={isDark ? "size-10 rounded bg-neutral-800" : "size-10 rounded bg-neutral-100"}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={isDark ? "font-medium text-neutral-50" : "font-medium text-neutral-900"}
            >
              {ad.name}
            </span>
            <span
              className={
                isDark
                  ? "rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 uppercase"
                  : "rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 uppercase"
              }
            >
              Ad
            </span>
          </div>
          {ad.description && (
            <p
              className={
                isDark
                  ? "mt-1 line-clamp-2 text-neutral-400 text-sm"
                  : "mt-1 line-clamp-2 text-neutral-600 text-sm"
              }
            >
              {ad.description}
            </p>
          )}
        </div>

        <ExternalLinkIcon
          className={isDark ? "size-4 text-neutral-500" : "size-4 text-neutral-400"}
        />
      </div>
    </a>
  )
}

function FallbackPromo({ workspaceId, zoneId }: { workspaceId: string; zoneId: string }) {
  const href = `/embed/packages?workspaceId=${encodeURIComponent(workspaceId)}&zoneId=${encodeURIComponent(zoneId)}`
  return (
    <a
      href={href}
      target="_top"
      className="grid place-items-center rounded-lg border border-neutral-200 border-dashed p-6 text-center text-neutral-500 text-sm hover:border-neutral-300 hover:text-neutral-700"
    >
      Advertise here →
    </a>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen place-items-center px-6">
      <p className="text-center text-muted-foreground text-sm">{children}</p>
    </div>
  )
}
