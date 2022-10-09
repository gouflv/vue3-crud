import { inject } from 'vue'
import {
  ListStoreInjectionKeyDefault,
  UseListStoreReturn
} from '../useListStore'

export function injectListStore<T extends UseListStoreReturn>(
  injectionKey = ListStoreInjectionKeyDefault
): T {
  const s = inject<T>(injectionKey)
  if (!s) {
    throw new Error('injectListStore: no store found')
  }
  return s
}
