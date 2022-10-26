import { InjectionKey, Ref } from 'vue'
import { resolveValue } from '../../../utils'
import { useRequest, UseRequestOptions } from '../../useRequest'

export type UseRemoveStoreOptions<TParams> = UseRequestOptions<TParams> & {}

export type UseRemoveStoreReturn<TParams = any> = {
  loading: Ref<boolean>
  remove: (params: TParams) => Promise<void>
}

export const RemoveStoreInjectionKey = Symbol(
  'RemoveStoreInjection'
) as InjectionKey<UseRemoveStoreReturn>

export function useRemoveStore<TParams = any>(
  options: UseRemoveStoreOptions<TParams>
): UseRemoveStoreReturn<TParams> {
  const { requestConfig, ...restUseRequestOptions } = options

  const { loading, error, send } = useRequest({
    requestConfig: ({ params }) => {
      const config = requestConfig ?? resolveValue(requestConfig, { params })
      return {
        method: 'DELETE',
        ...config
      }
    },
    ...restUseRequestOptions
  })

  const store = {
    loading,
    error,
    remove: send,
    __injectionKey: RemoveStoreInjectionKey
  }

  return store
}
