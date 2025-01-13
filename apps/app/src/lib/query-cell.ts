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

type ErrorResult<TData, TError> =
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverRefetchErrorResult<TData, TError>

type CreateQueryCellOptions<TError> = {
  /**
   * Default error handler for this cell
   */
  error: (query: ErrorResult<unknown, TError>) => ReactNode
  /**
   * Default pending handler for this cell
   */
  pending: (query: QueryObserverPendingResult<unknown, TError>) => ReactNode
}

type QueryCellOptions<TData, TError> = {
  query: UseQueryResult<TData, TError>
  /**
   * Optionally override default error handling
   */
  error?: (query: ErrorResult<TData, TError>) => ReactNode
  /**
   * Optionally override pending state
   */
  pending?: (query: QueryObserverPendingResult<TData, TError>) => ReactNode
}

type QueryCellOptionsWithEmpty<TData, TError> = {
  /**
   * Render callback for when the data is fetched successfully
   */
  success: (query: QueryObserverSuccessResult<NonNullable<TData>, TError>) => ReactNode
  /**
   * Render callback for when the data is empty - when the `data` is `null`-ish or an empty array
   */
  empty?: (query: QueryObserverSuccessResult<TData, TError>) => ReactNode
} & QueryCellOptions<TData, TError>

type QueryCellOptionsNoEmpty<TData, TError> = {
  success: (query: QueryObserverSuccessResult<TData, TError>) => ReactNode
} & QueryCellOptions<TData, TError>

export const createQueryCell = <TError>(queryCellOpts: CreateQueryCellOptions<TError>) => {
  function QueryCell<TData>(opts: QueryCellOptionsWithEmpty<TData, TError>): ReactNode
  function QueryCell<TData>(opts: QueryCellOptionsNoEmpty<TData, TError>): ReactNode
  function QueryCell<TData>(
    opts: QueryCellOptionsNoEmpty<TData, TError> | QueryCellOptionsWithEmpty<TData, TError>,
  ) {
    const { query } = opts

    if (query.status === "success") {
      if (
        "empty" in opts &&
        (query.data == null || (Array.isArray(query.data) && query.data.length === 0))
      ) {
        return opts.empty?.(query)
      }

      return opts.success(query as QueryObserverSuccessResult<NonNullable<TData>, TError>)
    }

    if (query.status === "error") {
      return opts.error?.(query) ?? queryCellOpts.error(query)
    }

    if (query.status === "pending") {
      return opts.pending?.(query) ?? queryCellOpts.pending(query)
    }

    // impossible state
    return null
  }

  return QueryCell
}
