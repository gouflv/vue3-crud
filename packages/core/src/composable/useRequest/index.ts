import { AxiosRequestConfig } from 'axios'
import { ref } from 'vue'
import { ConfigProvider } from '../../configuration/provider'
import { MaybeValueFnWithParams, PlainObject } from '../../types'
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

export function useRequest<TParams extends PlainObject>(
  options: UseRequestOptions<TParams>
) {
  const { requestService: request } = ConfigProvider.config

  const loading = ref(false)

  const finish = ref(false)

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

      finish.value = false

      const url = resolveValue(options.url, { params })

      const config = resolveValue(options.requestConfig, { params })

      const response = await request.request({
        url,
        ...config
      })

      finish.value = true

      post(response)
    } catch (error) {
      // TODO handle error
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    send
  }
}
