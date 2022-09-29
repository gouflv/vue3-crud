import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { ConfigProvider } from '../configuration/provider'
import { ResponseWrapper, UnwrappedResponse } from '../types'

export class RequestService {
  constructor() {}

  async request<T>(
    config: AxiosRequestConfig
  ): Promise<UnwrappedResponse<T> | undefined> {
    /**
     * Merge application config and request config
     */
    const mergeConfig = this.getRequestConfig(config)

    console.debug('Request config', mergeConfig)

    try {
      const response = await axios.request(mergeConfig)

      const normalizedResponse = this.normalizeResponse<T>(response.data)

      return this.unwrapResponse(normalizedResponse)
    } catch (e) {
      console.error(e)
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
    const defaults = {
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
   */
  normalizeResponse<T>(response: any): ResponseWrapper<T> {
    return response
  }

  unwrapResponse<T>(responseWrapper: ResponseWrapper<T>) {
    return responseWrapper.data as UnwrappedResponse<T>
  }

  requestErrorHandler(error: AxiosError | Error) {
    const { messageService } = ConfigProvider.config

    if (axios.isAxiosError(error)) {
      const { response, request } = error
      if (response) {
        // The request was made and the server responded with a status code
        if (response.status === 401) {
          this.onAuthFailed(error)
          return
        }
        messageService.open({ type: 'error', content: '服务繁忙' })
      } else if (request) {
        // The request was made but no response was received
        messageService.open({ type: 'error', content: '网络异常' })
      } else {
        messageService.open({ type: 'error', content: error.message })
      }
      return
    }

    messageService.open({ type: 'error', content: error.message })
  }

  /**
   * Implement in subclass
   */
  onAuthFailed(error: AxiosError) {}
}
