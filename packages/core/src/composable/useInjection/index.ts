import { inject } from 'vue'

export function useInjection<T>(injectionKey: string | Symbol): T {
  const s = inject<T>(injectionKey)
  if (!s) {
    throw new Error('injectListStore: no store found')
  }
  return s
}
