import { provide, ref } from 'vue'
import { PlainObject } from '../../types'
import { EditStoreOptions, useEditStore } from '../useEditStore'

export const EditModalStoreInjectionKey = Symbol('EditModalStoreInjection')

export function useEditModalStore<
  TForm extends PlainObject,
  TInitialParams extends PlainObject
>(options: EditStoreOptions<TForm, TInitialParams>) {
  const edit = useEditStore({
    ...options,

    // Abort `useEditStore`'s injection
    injectionKey: false,

    preAction: () => {
      visible.value = true
      options.preAction?.()
    },
    postSubmit: (response) => {
      visible.value = false
      options.postSubmit?.(response)
    }
  })

  const visible = ref(false)

  const store = {
    visible,
    ...edit
  }

  provide(options.injectionKey || EditModalStoreInjectionKey, store)

  return store
}

export type UseEditModalStoreReturn = ReturnType<typeof useEditModalStore>
