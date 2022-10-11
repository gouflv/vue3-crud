import { provide, ref } from 'vue'
import { PlainObject } from '../../types'
import { EditStoreOptions, useEditStore } from '../useEditStore'

export const EditModalStoreInjectionKey = Symbol('EditModalStoreInjection')

export function useEditModalStore<
  TForm extends PlainObject,
  TInitialParams extends PlainObject
>(options: EditStoreOptions<TForm, TInitialParams>) {
  const edit = useEditStore({
    injectionKey: false,

    ...options,

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

  if (options.injectionKey) {
    console.debug('[useEditModalStore] Injection')
    provide(
      typeof options.injectionKey === 'boolean'
        ? EditModalStoreInjectionKey
        : options.injectionKey,
      store
    )
  }

  return store
}

export type UseEditModalStoreReturn = ReturnType<typeof useEditModalStore>
