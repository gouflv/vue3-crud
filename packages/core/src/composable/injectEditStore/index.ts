import { inject } from 'vue'
import {
  EditStoreInjectionKeyDefault,
  UseEditStoreReturn
} from '../useEditStore'

export function injectEditStore<T extends UseEditStoreReturn>(
  injectionKey = EditStoreInjectionKeyDefault
): T {
  const s = inject<T>(injectionKey)
  if (!s) {
    throw new Error('injectEditStore: no store found')
  }
  return s
}
