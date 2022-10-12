import { provide } from 'vue'

/**
 *
 *
 * @example ```ts
 *   function useSomeThing() {
 *     return {
 *       value: 1,
 *       __injectionKey: 'Key'
 *     }
 *   }
 *   const { value } = withInjection(useSomeThing())
 *   const { value } = withInjection(useSomeThing(), 'customKey')
 */
export function withInjection<T extends { __injectionKey?: string | Symbol }>(
  value: T,
  injectionKey?: string | Symbol
) {
  const key = injectionKey ?? value.__injectionKey

  if (!key) {
    throw new Error('Injection key is not defined')
  }

  console.debug('[withInjection] Injection', key, value)
  provide(key, value)

  return value
}
