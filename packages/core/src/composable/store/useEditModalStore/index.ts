import { InjectionKey, Ref } from 'vue'
import { PlainObject } from '../../../types'
import {
  EditStoreOptions,
  useEditStore,
  UseEditStoreReturn
} from '../useEditStore'
import { useModalStore } from '../useModalStore'

export type UseEditModalStoreReturn = UseEditStoreReturn<any, any> & {
  visible: Ref<boolean>
}

export const EditModalStoreInjectionKey = Symbol(
  'EditModalStoreInjection'
) as InjectionKey<UseEditModalStoreReturn>

export function useEditModalStore<
  TFormData extends PlainObject,
  TInitialParams extends PlainObject
>(
  options: EditStoreOptions<TFormData, TInitialParams>
): UseEditModalStoreReturn {
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
