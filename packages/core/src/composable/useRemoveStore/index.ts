import { provide } from 'vue'
import { PlainObject } from '../../types'
import { resolveValue } from '../../utils'
import { useRequest, UseRequestOptions } from '../useRequest'

export const RemoveStoreInjectionKey = Symbol('RemoveStoreInjectionKey')

export type UseRemoveStoreOptions<TParams> = UseRequestOptions<TParams> & {
  injectionKey?: boolean | string | Symbol
}

export function useRemoveStore<TParams extends PlainObject>(
  options: UseRemoveStoreOptions<TParams>
) {
  const { injectionKey, requestConfig, ...restUseRequestOptions } = options

  const { loading, send } = useRequest({
    requestConfig: (args) => {
      const config = requestConfig ?? resolveValue(requestConfig, args)
      return {
        method: 'DELETE',
        ...config
      }
    },
    ...restUseRequestOptions
  })

  const store = {
    loading,
    remove: send
  }

  if (injectionKey) {
    console.debug('[useRemoveStore] Injection')
    provide(
      typeof injectionKey === 'boolean'
        ? RemoveStoreInjectionKey
        : injectionKey,
      store
    )
  }

  return store
}
