import { inject, InjectionKey } from 'vue'

export function useInjection<T>(
  injectionKey: string | Symbol | InjectionKey<T>
): T {
  const s = inject<T>(injectionKey)
  if (!s) {
    throw new Error(`useInjection: ${injectionKey} no found`)
  }
  return s
}
