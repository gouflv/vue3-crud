/**
 * Standard format of server response data
 */
export type ResponseWrapper<T = any> = {
  code: number
  message: string
  data: T
}

export type UnwrappedResponse<T> = ResponseWrapper<T>['data']
