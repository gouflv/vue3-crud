import axios, { AxiosRequestConfig } from 'axios'

export class RequestService {
  async get<T>(url: string, query?: any, options?: AxiosRequestConfig) {
    const response = await axios.get<T>(url, { params: query, ...options })
    return response
  }
}
