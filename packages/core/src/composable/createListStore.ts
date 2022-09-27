import { provide, ref, toRefs } from 'vue'
import { RequestService } from '../services'
import {
  PaginationQuery,
  PaginationResponseData,
  ReturnValueFn
} from '../types'
import { valueOf } from '../utils'

type PlainObject = Record<string, string | number | boolean | object>

export function createListStore<
  TItem extends PlainObject,
  TSearch extends PlainObject,
  TInitialParams extends PlainObject
>(options: {
  /**
   * Provide `ListStore` to descendants components by `injection` key
   */
  injectionKey?: string | Symbol

  /**
   * Initial params
   */
  initialParams?: () => TInitialParams

  /**
   * `url` used to fetch list
   *
   * Pass value or function that returns value
   *
   * If function is passed, it will be called with `initialParams`
   */
  url: string | ReturnValueFn<string, { initialParams?: TInitialParams }>

  /**
   * Return an object that will be used as `params` of `fetch` request
   */
  getFetchParams?: (state: {
    initialParams?: TInitialParams
    search: TSearch
    pagination: PaginationQuery
  }) => PlainObject

  /**
   * Transform response data into `PaginationResponse`
   */
  transformResponse?: (response: any) => PaginationResponseData

  /**
   * Transform `items` of `PaginationResponse` into `TItem`
   */
  transformItems?: (items: PaginationResponseData['items']) => TItem[]
}) {
  const request = new RequestService()

  const initialParams = ref<TInitialParams>({} as TInitialParams)

  const search = ref<TSearch>({} as TSearch)

  const url = ref<string>()

  const paginationQuery = ref<PaginationQuery>({
    page: 0,
    size: 20
  })

  const pageData = ref<{
    items: TItem[]
    page: number
    size: number
    total: number
  }>()

  const loading = ref(false)

  function setup() {
    if (options.initialParams) {
      initialParams.value = options.initialParams()
    }

    url.value = valueOf(options.url, { initialParams: initialParams.value })
  }

  async function fetch() {
    if (!url.value) {
      throw new Error('`url` is required')
    }

    try {
      loading.value = true

      const res = await request.get(url.value, getFetchParams())

      const paginationResponse = transformResponse(res.data)

      pageData.value = {
        items: transformItems(paginationResponse.items),
        page: paginationResponse.page,
        size: paginationResponse.size,
        total: paginationResponse.total
      }
    } catch (error) {
      // Call MessageService to show error
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Return fetch params
   *
   * If `option.getFetchParams` is provided, use it to get fetch params
   *
   * Otherwise, return default fetch params that combine `search` and `pagination`
   */
  function getFetchParams() {
    if (options.getFetchParams) {
      return options.getFetchParams({
        initialParams: initialParams.value,
        search: search.value,
        pagination: paginationQuery.value
      })
    }
    return {
      ...search.value,
      ...paginationQuery.value
    }
  }

  /**
   * Call `options.transformResponse` to transform response data if provided
   *
   * Otherwise, return response data directly
   */
  function transformResponse(response: any): PaginationResponseData<unknown> {
    // TODO call `global.transformResponse` if provided
    if (options.transformResponse) {
      return options.transformResponse(response)
    }
    return response
  }

  /**
   * Call `options.transformItems` to transform items if provided
   *
   * Otherwise, return items directly
   */
  function transformItems(items: unknown[]): TItem[] {
    if (options.transformItems) {
      return options.transformItems(items)
    }
    return items as TItem[]
  }

  /**
   * Update `search` and re-fetch
   */
  function setSearch(value: Partial<TSearch>) {
    search.value = value
    setPaginationQuery({ page: 0 })
    fetch()
  }

  /**
   * Merge `value` into `paginationQuery` and re-fetch
   */
  function setPaginationQuery(value: Partial<PaginationQuery>) {
    paginationQuery.value = { ...paginationQuery.value, ...value }
    fetch()
  }

  setup()

  const store = {
    ...toRefs(pageData),
    loading,
    actions: {
      fetch,
      setSearch,
      setPaginationQuery
    }
  }

  if (options.injectionKey) {
    provide(options.injectionKey, store)
  }

  return store
}
