import axiosInstance, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
import { ConfigProvider } from '../configuration/provider'
import { ResponseWrapper, UnwrappedResponse } from '../types'

export class RequestService {
  constructor(private axios: AxiosInstance = axiosInstance) {}

  async request<T>(
    config: AxiosRequestConfig
  ): Promise<UnwrappedResponse<T> | undefined> {
    /**
     * Merge application config and request config
     */
    const mergeConfig = this.getRequestConfig(config)

    console.debug('[RequestService] Request config', mergeConfig)

    try {
      const response = await this.axios.request(mergeConfig)

      const normalizedResponse = this.normalizeResponse<T>(response.data)

      const result = this.unwrapResponse(normalizedResponse)

      console.debug('[RequestService] Response data', result)

      return result
    } catch (e) {
      const ex = e as AxiosError
      this.requestErrorHandler(ex)

      throw e
    }
  }

  async get<T>(url: string, query?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ method: 'get', url, params: query, ...config })
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ method: 'post', url, data, ...config })
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ method: 'put', url, data, ...config })
  }

  async delete<T>(url: string, query?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ method: 'delete', url, params: query, ...config })
  }

  /**
   * Merge default config and request config
   *
   * May be override in subclass
   */
  getRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const defaults: AxiosRequestConfig = {
      baseURL: '/api',
      timeout: 10_000,
      headers: {
        // token etc.
      }
    }
    return { ...defaults, ...config }
  }

  /**
   * Normalize response to standard format - `ResponseWrapper`
   *
   * May be override in subclass
   *
   * @example ```ts
   *   // Wrap pure response to `ResponseWrapper`
   *   normalizeResponse(response) {
   *     return { data: response }
   *   }
   * ```
   */
  normalizeResponse<T>(response: any): ResponseWrapper<T> {
    return response
  }

  unwrapResponse<T>(responseWrapper: ResponseWrapper<T>) {
    return responseWrapper.data as UnwrappedResponse<T>
  }

  requestErrorHandler(error: AxiosError) {
    if (error.name === 'CanceledError') {
      return
    }

    const { messageService } = ConfigProvider.config

    console.error(error)

    if (error.isAxiosError) {
      const { response, request } = error
      if (response) {
        // The request was made and the server responded with a status code

        if (this.isAuthFailed(response)) {
          this.onAuthFailed(error)
          return
        }

        // TODO show error message in `response.data`
        messageService.open({ type: 'error', content: '服务繁忙' })
      } else if (request) {
        // The request was made but no response was received

        messageService.open({ type: 'error', content: '网络异常' })
      } else {
        // Internal error

        messageService.open({ type: 'error', content: error.message })
      }
      return
    }

    messageService.open({ type: 'error', content: error.message })
  }

  isAuthFailed(response: AxiosResponse) {
    return response.status === 401
  }

  /**
   * Auth failed handler
   * Implement in subclass
   */
  onAuthFailed(error: AxiosError) {
    console.error('[RequestService] Should implement `onAuthFailed`', error)
  }
}
