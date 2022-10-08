import { isFunction, MaybeValueFn, MaybeValueFnWithParams } from '../types'

/**
 * Return the value of `valuable`
 *
 * If `valuable` is a function, it will be called with `params`, and the return value will be returned
 *
 * Otherwise, it will be returned directly
 */
export function resolveValue<R, P>(
  valuable: R | MaybeValueFn<R> | MaybeValueFnWithParams<R, P>,
  params?: P
): R {
  if (isFunction(valuable)) {
    return params
      ? (valuable as MaybeValueFnWithParams<R, P>)(params)
      : (valuable as MaybeValueFn<R>)()
  }
  return valuable
}

/**
 * Return the value of `valuable`
 *
 * If `valuable` is a function, it will be called with `params`
 *
 * - If the return value is a promise, it will be resolved and the resolved value will be returned
 *
 * - Otherwise, it will be returned directly
 *
 * Otherwise, it will be returned directly
 */
export async function resolveAsyncValue<R, P>(
  valuable: R | MaybeValueFnWithParams<R, P>,
  params: P
): Promise<R> {
  if (isFunction(valuable)) {
    const returned = valuable(params)

    if (returned instanceof Promise) {
      return await returned
    }

    return returned
  }
  return valuable
}
