export type PaginationQuery = {
  /**
   * Page index, starts from 0
   */
  page: number

  /**
   * Number of items per page
   */
  size: number
}

export type SortableQuery = {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Standard pagination response for ListStore
 */
export type PaginationResponseData<T = unknown> = {
  items: T[]
  page: number
  size: number
  total: number
}
