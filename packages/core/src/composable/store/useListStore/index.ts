import { AxiosRequestConfig } from 'axios'
import { InjectionKey, Ref, ref } from 'vue'
import { ConfigProvider } from '../../../configuration/provider'
import {
  MaybePromiseFnWithParams,
  MaybeValueFn,
  MaybeValueFnWithParams,
  PageData,
  PaginationQuery,
  PaginationResponse,
  PlainObject
} from '../../../types'
import { resolveAsyncValue, resolveValue } from '../../../utils'

type UseListStoreOptions<TItem, TSearch, TInitialParams> = {
  /**
   * Initial params
   *
   * TODO:
   * - Support a reactive object
   */
  initialParams?: MaybeValueFn<TInitialParams>

  /**
   * `url` used to fetch list
   *
   * Pass value or function that returns value
   *
   * If function is passed, it will be called with `initialParams`
   *
   * @example ```ts
   *   url: '/api/users'
   *   url: (initialParams) => '/api/users'
   * ```
   */
  url: MaybeValueFnWithParams<string, { initialParams?: TInitialParams }>

  /**
   * Return an object that will be used as `params` of `fetch` request
   */
  createFetchQuery?: (state: {
    initialParams: TInitialParams
    search?: TSearch
    pagination: PaginationQuery
  }) => PlainObject

  /**
   * Return additional axios config
   */
  getFetchConfig?: () => AxiosRequestConfig

  /**
   * Default search
   */
  defaultSearch?: MaybePromiseFnWithParams<
    TSearch,
    { initialParams: TInitialParams }
  >

  /**
   * Transform response data into `PaginationResponse`
   */
  transformResponse?: (response: any) => PaginationResponse<TItem>

  /**
   * Transform `items` of PaginationResponse into `TItem`
   */
  transformItems?: (items: any[]) => TItem[]

  /**
   * Automatically fetch when `useListStore` is called
   *
   * Default: `true`
   */
  immediate?: boolean

  postFetch?: () => void
}

export type UseListStoreReturn<
  TItem = any,
  TSearch = any,
  TInitialParams = any
> = {
  data: Ref<PageData<TItem>>
  loading: Ref<boolean>
  error: Ref<Error | undefined>
  initialParams: Ref<TInitialParams>
  pagination: Ref<PaginationQuery>
  search: Ref<TSearch>
  actions: {
    fetch: () => void
    setInitialParams: (initialParams: TInitialParams) => void
    setSearch: (search: TSearch) => void
    setPagination: (
      value: MaybeValueFnWithParams<Partial<PaginationQuery>, PaginationQuery>
    ) => void
  }
  __injectionKey: string | Symbol
}

export const ListStoreInjectionKey = Symbol(
  'ListStoreInjection'
) as InjectionKey<UseListStoreReturn>

export function useListStore<TItem = any, TSearch = any, TInitialParams = any>(
  options: UseListStoreOptions<TItem, TSearch, TInitialParams>
) {
  const { requestService: request } = ConfigProvider.config

  const initialParams = ref({}) as Ref<TInitialParams>

  const search = ref({}) as Ref<TSearch>

  const pagination = ref({
    page: 0,
    size: 20
  }) as Ref<PaginationQuery>

  /**
   * Data of current page
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
        resolveValue(options.url, { initialParams: initialParams.value }),
        getFetchQuery(),
        getFetchConfig()
      )

      const paginationResponse = transformResponse(unwrappedResponse)

      console.debug('[useListStore] PaginationResponse', paginationResponse)

      data.value = {
        items: transformItems(paginationResponse.items),
        page: paginationResponse.page,
        size: paginationResponse.size,
        total: paginationResponse.total
      }

      options.postFetch?.()
    } catch (e: any) {
      console.error('[useListStore] Fetch error', e)
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
    if (options.createFetchQuery) {
      return options.createFetchQuery({
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
   * Replace `initialParams` with new value
   */
  function setInitialParams(value: TInitialParams) {
    initialParams.value = value
  }

  /**
   * Replace `search` with new value and refetch
   */
  function setSearch(value: TSearch) {
    search.value = value
    pagination.value = { ...pagination.value, page: 0 }
    fetch()
  }

  /**
   * Update `pagination` with new value and refetch
   *
   * value can be `PaginationQuery` or a function that returns `PaginationQuery`
   */
  function setPagination(
    value: MaybeValueFnWithParams<Partial<PaginationQuery>, PaginationQuery>
  ) {
    const newValue = resolveValue(value, pagination.value)
    pagination.value = { ...pagination.value, ...newValue }
    fetch()
  }

  const store: UseListStoreReturn<TItem, TSearch, TInitialParams> = {
    data,
    loading,
    initialParams,
    pagination,
    search,
    error,
    actions: {
      fetch,
      setInitialParams,
      setSearch,
      setPagination
    },
    __injectionKey: ListStoreInjectionKey
  }

  async function setup() {
    if (options.initialParams) {
      initialParams.value = resolveValue(options.initialParams)
    }

    if (options.defaultSearch) {
      search.value = await resolveAsyncValue(options.defaultSearch, {
        initialParams: initialParams.value
      })
    }

    // TODO restore user pagination

    const immediate = options.immediate ?? true
    if (immediate) {
      fetch()
    }
  }

  setup()

  return store
}
