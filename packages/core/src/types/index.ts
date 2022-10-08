export * from './request'
export * from './list'

export type PlainObject = Record<string, string | number | boolean | object>

export type MaybeValueFn<R> = R | (() => R)

export type MaybeValueFnWithParams<R, P> = R | ((params: P) => R)

export type MaybePromiseFn<R> = MaybeValueFn<R> | (() => Promise<R>)

export type MaybePromiseFnWithParams<R, P> =
  | MaybeValueFnWithParams<R, P>
  | ((params: P) => Promise<R>)

/**
 * Solution of `T & Function` error whit `T | (() => T)`
 *
 * @see https://github.com/microsoft/TypeScript/issues/37663
 */
export const isFunction = (x: unknown): x is Function => typeof x === 'function'
