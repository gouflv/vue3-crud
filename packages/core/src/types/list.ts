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
 * Standard response of pagination request
 */
export type PaginationResponse<T = unknown> = {
  items: T[]
  page: number
  size: number
  total: number
}

export type PageData<T> = {
  items: T[]
  page: number
  size: number
  total: number
}
