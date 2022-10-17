import { InjectionKey, Ref } from 'vue'
import { PlainObject } from '../../../types'
import { resolveValue } from '../../../utils'
import { useRequest, UseRequestOptions } from '../../useRequest'

export type UseRemoveStoreOptions<TParams> = UseRequestOptions<TParams> & {}

export type UseRemoveStoreReturn<TParams> = {
  loading: Ref<boolean>
  remove: (params: TParams) => Promise<void>
}

export const RemoveStoreInjectionKey = Symbol(
  'RemoveStoreInjection'
) as InjectionKey<UseRemoveStoreReturn<any>>

export function useRemoveStore<TParams extends PlainObject>(
  options: UseRemoveStoreOptions<TParams>
): UseRemoveStoreReturn<TParams> {
  const { requestConfig, ...restUseRequestOptions } = options

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
    remove: send,
    __injectionKey: RemoveStoreInjectionKey
  }

  return store
}
