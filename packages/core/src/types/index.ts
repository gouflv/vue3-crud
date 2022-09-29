export * from './request'
export * from './list'

export type PlainObject = Record<string, string | number | boolean | object>

export type ReturnValueFn<T, P> = (params?: P) => T
