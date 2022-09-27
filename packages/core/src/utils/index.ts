import { ReturnValueFn } from '../types'

/**
 * Return the value of `valuable`
 *
 * If `valuable` is a function, it will be called with `params`, and the return value will be returned
 *
 * Otherwise, it will be returned directly
 */
export function valueOf<T, P>(
  valuable: T | ReturnValueFn<T, P>,
  params?: P
): T {
  return typeof valuable === 'function'
    ? (valuable as ReturnValueFn<T, P>)(params)
    : valuable
}
