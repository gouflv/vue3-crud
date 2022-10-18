import { InjectionKey, Ref } from 'vue'
import {
  UseEditStoreOptions,
  useEditStore,
  UseEditStoreReturn
} from '../useEditStore'
import { useModalStore } from '../useModalStore'

export type UseEditModalStoreReturn<
  TFormData = any,
  TInitialParams = any
> = UseEditStoreReturn<TFormData, TInitialParams> & {
  visible: Ref<boolean>
}

export const EditModalStoreInjectionKey = Symbol(
  'EditModalStoreInjection'
) as InjectionKey<UseEditModalStoreReturn>

export function useEditModalStore<TFormData = any, TInitialParams = any>(
  options: UseEditStoreOptions<TFormData, TInitialParams>
): UseEditModalStoreReturn<TFormData, TInitialParams> {
  const { actions: modalActions, visible } = useModalStore()
  const edit = useEditStore<TFormData, TInitialParams>({
    ...options,

    preAction: () => {
      modalActions.open()
      options.preAction?.()
    },
    postSubmit: (response) => {
      modalActions.close()
      options.postSubmit?.(response)
    }
  })

  const store = {
    ...edit,
    visible,
    __injectionKey: EditModalStoreInjectionKey
  }

  return store
}
