export * from './request'
export * from './list'

export type PlainObject = Record<string, string | number | boolean | object>

export type ReturnValueFn<R> = () => R
export type ReturnValueFnWithParams<R, P> = (params: P) => R

export type ReturnPromiseFn<R> = () => Promise<R>
export type ReturnPromiseFnWithParams<R, P> = (params: P) => Promise<R>

export type MaybeValueFn<R> = R | ReturnValueFn<R>
export type MaybeValueFnWithParams<R, P> = R | ReturnValueFnWithParams<R, P>

export type MaybePromiseFn<R> = MaybeValueFn<R> | ReturnPromiseFn<R>
export type MaybePromiseFnWithParams<R, P> =
  | MaybeValueFnWithParams<R, P>
  | ReturnPromiseFnWithParams<R, P>

/**
 * Solution of `T & Function` error whit `T | (() => T)`
 *
 * @see https://github.com/microsoft/TypeScript/issues/37663
 */
export const isFunction = (x: unknown): x is Function => typeof x === 'function'
