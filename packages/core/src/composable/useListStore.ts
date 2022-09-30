import { inject } from 'vue'
import {
  CreateListStoreReturn,
  ListStoreInjectionKeyDefault
} from './createListStore'

export function useListStore<T extends CreateListStoreReturn>(
  injectionKey: Symbol | string = ListStoreInjectionKeyDefault
) {
  return inject<T>(injectionKey)
}
