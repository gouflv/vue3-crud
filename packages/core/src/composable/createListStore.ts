import { AxiosRequestConfig } from 'axios'
import { provide, reactive, ref } from 'vue'
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
   *
   * TODO: support returns a promise
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

  const initialParams = reactive({}) as TInitialParams

  const search = reactive({}) as TSearch

  const pagination = reactive({
    page: 0,
    size: 20
  }) as PaginationQuery

  /**
   * Data of current page
   *
   * Not to use generic on `reactive` because it will cause type error
   */
  const data = reactive({
    items: [],
    page: 0,
    size: 0,
    total: 0
  }) as PageData<TItem>

  const loading = ref(false)

  const error = ref<Error>()

  const abortController = ref<AbortController>()

  function preFetch() {
    // Abort previous request and create a new AbortController
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()

    // Clear error
    error.value = undefined
  }

  async function fetch() {
    preFetch()

    try {
      loading.value = true

      const unwrappedResponse = await request.get(
        valueOf(options.url, { initialParams }),
        getFetchQuery(),
        getFetchConfig()
      )

      const paginationResponse = transformResponse(unwrappedResponse)

      Object.assign(data, <PageData<TItem>>{
        items: transformItems(paginationResponse.items),
        page: paginationResponse.page,
        size: paginationResponse.size,
        total: paginationResponse.total
      })
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
        initialParams,
        search,
        pagination
      })
    }
    return {
      ...initialParams,
      ...search,
      ...pagination
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
   * Replace `search` with new value and refetch
   */
  function setSearch(value: TSearch) {
    Object.assign(search, value)
    pagination.page = 0
    fetch()
  }

  function updateInitialParams(value: Partial<TInitialParams>) {
    Object.assign(initialParams, value)
  }

  /**
   * Update `search` with new value and refetch
   *
   * value can be `PaginationQuery` or a function that returns `PaginationQuery`
   */
  function updatePagination(
    value:
      | Partial<PaginationQuery>
      | ReturnValueFn<Partial<PaginationQuery>, PaginationQuery>
  ) {
    const newValue = valueOf(value, pagination)
    Object.assign(pagination, newValue)
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
      updateInitialParams,
      updatePagination
    }
  }

  function setup() {
    if (options.injectionKey) {
      const key =
        options.injectionKey === true
          ? ListStoreInjectionKeyDefault
          : options.injectionKey
      provide(key, store)
    }

    const immediate = options.immediate ?? true
    if (immediate) {
      fetch()
    }
  }

  setup()

  return store
}

export type CreateListStoreReturn = ReturnType<typeof createListStore>
