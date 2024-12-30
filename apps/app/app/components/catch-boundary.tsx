import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { useEffect } from "react"

export function CatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  const isRoot = useMatch({
    strict: false,
    select: state => state.id === rootRouteId,
  })

  useEffect(() => {
    // Reset the query error boundary
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  console.error(error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          type="button"
          onClick={() => {
            router.invalidate()
          }}
          className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
        >
          Try Again
        </button>

        {isRoot ? (
          <Link
            to="/"
            className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
            onClick={e => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}
