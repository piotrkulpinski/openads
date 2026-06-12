/**
 * Cells are a declarative approach to data fetching, inspired by https://redwoodjs.com/docs/cells
 */
import type {
  QueryObserverLoadingErrorResult,
  QueryObserverPendingResult,
  QueryObserverRefetchErrorResult,
  QueryObserverSuccessResult,
  UseQueryResult,
} from "@tanstack/react-query"
import type { ReactNode } from "react"
import { logger } from "~/lib/logger"

type ErrorResult<TData, TError> =
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverRefetchErrorResult<TData, TError>

type QueryCellProps<TData, TError> = {
  query: UseQueryResult<TData, TError>
  /**
   * Render callback for when the data is fetched successfully
   */
  success: (query: QueryObserverSuccessResult<NonNullable<TData>, TError>) => ReactNode
  /**
   * Render callback for when the data is empty - when the `data` is `null`-ish or an empty array
   */
  empty?: (query: QueryObserverSuccessResult<TData, TError>) => ReactNode
  /**
   * Render callback for the error state
   */
  error?: (query: ErrorResult<TData, TError>) => ReactNode
  /**
   * Render callback for the pending state
   */
  pending?: (query: QueryObserverPendingResult<TData, TError>) => ReactNode
}

export const QueryCell = <TData, TError = Error>(
  props: QueryCellProps<TData, TError>,
): ReactNode => {
  const { query } = props

  if (query.status === "success" && !query.isPlaceholderData) {
    if (
      props.empty &&
      (query.data == null || (Array.isArray(query.data) && query.data.length === 0))
    ) {
      return props.empty(query)
    }

    return props.success(query as QueryObserverSuccessResult<NonNullable<TData>, TError>)
  }

  if (query.status === "error") {
    logger.error("query cell error", { err: query.error })
    return props.error?.(query) ?? null
  }

  if (query.status === "pending") {
    return props.pending?.(query) ?? null
  }

  // impossible state
  return null
}
