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
      console.error('[RequestService] Request error', e)

      this.requestErrorHandler(e as AxiosError)
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
   *
   *   // rename response field
   *   normalizeResponse(response) {
   *    return { data: response.data, message: response.msg }
   *   }
   * ```
   */
  normalizeResponse<T>(response: any): ResponseWrapper<T> {
    return response
  }

  /**
   * Return `data` field of `ResponseWrapper`
   */
  unwrapResponse<T>(responseWrapper: ResponseWrapper<T>) {
    return responseWrapper.data as UnwrappedResponse<T>
  }

  requestErrorHandler(error: AxiosError) {
    const { messageService } = ConfigProvider.config

    // Ignore error if request is canceled
    if (error.name === 'CanceledError') {
      ;(error as any).__handled = true
      throw error
    }

    let hasHandled = false

    function showErrorMessage(message: string) {
      messageService.open({ type: 'error', content: message })
      hasHandled = true
    }

    if (error.isAxiosError) {
      const { response, request } = error
      if (response) {
        // The request was made and the server responded with a status code

        if (this.isAuthFailed(response)) {
          showErrorMessage('登录过期')
          this.onAuthFailed(error)
        } else {
          const responseWrapper = this.normalizeResponse(response.data)
          showErrorMessage(responseWrapper?.message || '服务繁忙')
        }
      } else if (request) {
        // The request was made but no response was received

        showErrorMessage('网络异常')
      } else {
        // Internal error

        showErrorMessage(error.message)
      }
    } else {
      // Unknown error
      showErrorMessage(error.message)
    }

    if (hasHandled) {
      ;(error as any).__handled = true
    }

    throw error
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

export function isUnhandledRequestError(error: Error) {
  return !(error as any).__handled
}
