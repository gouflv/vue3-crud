import { InjectionKey, Ref, ref } from 'vue'
import { MaybeValueFn, PlainObject } from '../../../types'
import { resolveValue } from '../../../utils'

export type UseModalStoreOptions<TInitialParams> = {
  initialParams?: MaybeValueFn<TInitialParams>
}

export type UseModalStoreReturn<TParams, TInitialParams> = {
  visible: Ref<boolean>
  initialParams: Ref<TInitialParams>
  params: Ref<TParams | undefined>
  actions: {
    open: (params?: TParams) => void
    close: () => void
  }
  __injectionKey: string | Symbol
}

export const ModalStoreInjectionKey = Symbol(
  'ModalStoreInjection'
) as InjectionKey<UseModalStoreReturn<any, any>>

export function useModalStore<
  TParams extends PlainObject,
  TInitialParams extends PlainObject
>(
  options?: UseModalStoreOptions<TInitialParams>
): UseModalStoreReturn<TParams, TInitialParams> {
  const initialParams = ref(
    resolveValue(options?.initialParams) ?? {}
  ) as Ref<TInitialParams>

  const visible = ref(false)

  const params = ref<TParams>()

  function open(_params?: TParams) {
    params.value = _params
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return {
    visible,
    initialParams,
    params,
    actions: {
      open,
      close
    },
    __injectionKey: ModalStoreInjectionKey
  }
}
