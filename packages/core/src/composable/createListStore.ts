import { AxiosRequestConfig } from 'axios'
import { provide, ref } from 'vue'
import { RequestService } from '../services'
import {
  PageData,
  PaginationQuery,
  PaginationResponse,
  PlainObject,
  ResponseWrapper,
  ReturnValueFn
} from '../types'
import { valueOf } from '../utils'

type ListStoreOptions<TItem, TSearch, TInitialParams> = {
  /**
   * Provide `ListStore` to descendants components by `injection` key
   */
  injectionKey?: boolean | string | Symbol

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
}

export function createListStore<
  TItem extends PlainObject,
  TSearch extends PlainObject,
  TInitialParams extends PlainObject
>(options: ListStoreOptions<TItem, TSearch, TInitialParams>) {
  const request = new RequestService()

  const initialParams = ref<TInitialParams>({} as TInitialParams)

  const search = ref<TSearch>({} as TSearch)

  const paginationQuery = ref<PaginationQuery>({
    page: 0,
    size: 20
  })

  const data = ref<PageData<TItem>>()

  const loading = ref(false)

  function setup() {
    if (options.initialParams) {
      initialParams.value = options.initialParams()
    }
  }

  async function fetch() {
    try {
      loading.value = true

      const res = await request.get(
        valueOf(options.url, { initialParams: initialParams.value }),
        getFetchQuery(),
        getFetchConfig()
      )

      const paginationResponse = transformResponse(res)

      data.value = {
        items: transformItems(paginationResponse.items),
        page: paginationResponse.page,
        size: paginationResponse.size,
        total: paginationResponse.total
      }
    } catch (e) {
      // Ignore
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
        pagination: paginationQuery.value
      })
    }
    return {
      ...search.value,
      ...paginationQuery.value
    }
  }

  /**
   * Return request config
   *
   * TODO providers abortSignal
   */
  function getFetchConfig(): AxiosRequestConfig {
    return options.getFetchConfig ? options.getFetchConfig() : {}
  }

  /**
   * Call `options.transformResponse` to transform response data if provided
   *
   * Otherwise, return response data directly
   *
   * @param response Pure response json
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

  const store = {
    pageData: data,
    loading,
    actions: {
      fetch,
      setSearch,
      setPaginationQuery
    }
  }

  setup()

  const injectionKeyDefault = 'ListStoreInjection'
  if (options.injectionKey) {
    provide(
      typeof options.injectionKey === 'boolean'
        ? injectionKeyDefault
        : options.injectionKey,
      store
    )
  }

  return store
}

export type CreateListStoreReturn = ReturnType<typeof createListStore>
