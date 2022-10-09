import { ref } from 'vue'
import { PlainObject } from '../../types'
import { EditStoreOptions, useEditStore } from '../useEditStore'

export function useEditModalStore<
  TForm extends PlainObject,
  TInitialParams extends PlainObject
>(options: EditStoreOptions<TForm, TInitialParams>) {
  const edit = useEditStore({
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

  return {
    visible,
    ...edit
  }
}
