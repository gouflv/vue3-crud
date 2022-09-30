import { AxiosRequestConfig } from 'axios'
import { provide, Ref, ref } from 'vue'
import { ConfigProvider } from '../configuration/provider'
import {
  PageData,
  PaginationQuery,
  PaginationResponse,
  PlainObject,
  ReturnValueFn
} from '../types'
import { valueOf } from '../utils'

export const ListStoreInjectionKeyDefault = 'ListStoreInjection'

type ListStoreOptions<TItem, TSearch, TInitialParams> = {
  /**
   * Provide `ListStore` to descendants components by `injection` key
   */
  injectionKey?: true | string | Symbol

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
  getFetchQuery?: (state: {
    initialParams?: TInitialParams
    search: TSearch
    pagination: PaginationQuery
  }) => PlainObject

  /**
   * Return axios config
   */
  getFetchConfig?: () => AxiosRequestConfig

  /**
   * Transform response data into `PaginationResponse`
   */
  transformResponse?: (response: any) => PaginationResponse<TItem>

  /**
   * Transform `items` of PaginationResponse into `TItem`
   */
  transformItems?: (items: any[]) => TItem[]

  /**
   * Automatically fetch when `createListStore` is called
   *
   * Default: `true`
   */
  immediate?: boolean
}

export function createListStore<
  TItem extends PlainObject,
  TSearch extends PlainObject,
  TInitialParams extends PlainObject
>(options: ListStoreOptions<TItem, TSearch, TInitialParams>) {
  const { requestService: request } = ConfigProvider.config

  const initialParams = ref<TInitialParams>({} as TInitialParams)

  const search = ref<Partial<TSearch>>({})

  const pagination = ref<PaginationQuery>({
    page: 0,
    size: 20
  })

  /**
   * Data of current page
   *
   * Note: Not use generic for `reactive`
   */
  const data = ref({
    items: [],
    page: 0,
    size: 0,
    total: 0
  }) as Ref<PageData<TItem>>

  const loading = ref(false)

  const error = ref<Error>()

  const abortController = ref<AbortController>()

  function setup() {
    if (options.initialParams) {
      initialParams.value = options.initialParams()
    }
  }

  function beforeFetch() {
    // Abort previous request and create a new AbortController
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()

    // Clear error
    error.value = undefined
  }

  async function fetch() {
    beforeFetch()

    try {
      loading.value = true

      const unwrappedResponse = await request.get(
        valueOf(options.url, { initialParams: initialParams.value }),
        getFetchQuery(),
        getFetchConfig()
      )

      const paginationResponse = transformResponse(unwrappedResponse)

      data.value = {
        items: transformItems(paginationResponse.items),
        page: paginationResponse.page,
        size: paginationResponse.size,
        total: paginationResponse.total
      }
    } catch (e: any) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  /**
   * Return request query data
   *
   * If `option.getFetchQuery` is provided, use it to get fetch query
   *
   * Otherwise, return default fetch query that combine `search` and `pagination`
   */
  function getFetchQuery() {
    if (options.getFetchQuery) {
      return options.getFetchQuery({
        initialParams: initialParams.value,
        search: search.value,
        pagination: pagination.value
      })
    }
    return {
      ...initialParams.value,
      ...search.value,
      ...pagination.value
    }
  }

  /**
   * Merge default fetchConfig and `option.getFetchConfig`
   */
  function getFetchConfig(): AxiosRequestConfig {
    const defaults: AxiosRequestConfig = {
      signal: abortController.value?.signal
    }
    const config = options.getFetchConfig ? options.getFetchConfig() : {}
    return { ...defaults, ...config }
  }

  /**
   * Transform response data into `PaginationResponse`
   *
   * Call `options.transformResponse` if provided.
   * Otherwise, return response data directly
   */
  function transformResponse(response: any): PaginationResponse<TItem> {
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
    pagination.value = { ...pagination.value, page: 0 }
    fetch()
  }

  /**
   * Merge `value` into `pagination` and re-fetch
   *
   * value can be `PaginationQuery` or a function that returns `PaginationQuery`
   */
  function setPagination(
    value:
      | Partial<PaginationQuery>
      | ReturnValueFn<Partial<PaginationQuery>, PaginationQuery>
  ) {
    const newValue = valueOf(value, pagination.value)
    pagination.value = { ...pagination.value, ...newValue }
    fetch()
  }

  const store = {
    data,
    loading,
    pagination,
    search,
    actions: {
      fetch,
      setSearch,
      setPaginationQuery: setPagination
    }
  }

  setup()

  function injection() {
    if (!options.injectionKey) return
    const key =
      options.injectionKey === true
        ? ListStoreInjectionKeyDefault
        : options.injectionKey
    provide(key, store)
  }
  injection()

  return store
}

export type CreateListStoreReturn = ReturnType<typeof createListStore>
