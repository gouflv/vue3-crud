import { inject } from 'vue'
import { CreateListStoreReturn, DefaultInjectionKey } from './createListStore'

export function useListStore<T extends CreateListStoreReturn>(
  injectionKey: Symbol | string = DefaultInjectionKey
) {
  return inject<T>(injectionKey)
}
