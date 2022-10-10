import { inject } from 'vue'

export function useInjection<T>(injectionKey: string | Symbol): T {
  const s = inject<T>(injectionKey)
  if (!s) {
    throw new Error(`useInjection: ${injectionKey} no found`)
  }
  return s
}
