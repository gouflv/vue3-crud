import { AxiosRequestConfig } from 'axios'
import { ref } from 'vue'
import { ConfigProvider } from '../../configuration/provider'
import { isUnhandledRequestError } from '../../services'
import { MaybeValueFnWithParams } from '../../types'
import { resolveValue } from '../../utils'

export type UseRequestOptions<TParams> = {
  /**
   * `url` used to send request
   */
  url: MaybeValueFnWithParams<string, { params: TParams }>

  /**
   * Return additional axios config
   *
   * @example ```ts
   *  // set request method
   *  requestConfig: () => ({ method: 'POST' })
   *
   *  // add request params or data
   *  requestConfig: ({ params }) => ({ data: { ... } })
   * ```
   */
  requestConfig?: MaybeValueFnWithParams<
    AxiosRequestConfig,
    { params: TParams }
  >

  preRequest?: () => void

  postRequest?: (response: any) => void
}

export function useRequest<TParams = any>(options: UseRequestOptions<TParams>) {
  const { requestService: request } = ConfigProvider.config

  const loading = ref(false)

  const error = ref<Error>()

  const abortController = ref<AbortController>()

  function pre() {
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()

    options.preRequest?.()
  }

  function post(response: any) {
    options.postRequest?.(response)
  }

  async function send(params: TParams) {
    try {
      pre()

      loading.value = true

      const url = resolveValue(options.url, { params })

      const config = resolveValue(options.requestConfig, { params })

      const response = await request.request({
        url,
        ...config
      })

      post(response)
    } catch (e: any) {
      if (isUnhandledRequestError(e)) {
        console.error('[useRequest] Request error', e)
        error.value = e as Error
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    send
  }
}
