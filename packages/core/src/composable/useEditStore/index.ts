import { AxiosRequestConfig } from 'axios'
import { cloneDeep, isElement } from 'lodash-es'
import { InjectionKey, Ref, ref } from 'vue'
import { ConfigProvider } from '../../configuration/provider'
import {
  MaybePromiseFnWithParams,
  MaybeValueFn,
  MaybeValueFnWithParams,
  PlainObject
} from '../../types'
import { resolveAsyncValue, resolveValue } from '../../utils'

export type EditStoreOptions<TFromData, TInitialParams> = {
  /**
   * Initial params
   *
   * TODO:
   * - Support a reactive object
   */
  initialParams?: MaybeValueFn<TInitialParams>

  /**
   * Return default formData for `add` mode
   *
   * If function is passed, it will be called with `initialParams` and `actionParams`
   *
   * Otherwise, it will be used as default formData
   *
   * @example ```ts
   *   getInitialFormData: { name: 'foo' }
   *   getInitialFormData: ({ initialParams, actionParams }) => ({ name: 'foo' })
   *   getInitialFormData: async ({ initialParams, actionParams }) => await SomeFetchFunction
   * ```
   */
  defaultFormData?: MaybePromiseFnWithParams<
    TFromData,
    { initialParams: TInitialParams; actionParams: any }
  >

  /**
   * `url` used to fetch form data
   */
  fetchUrl?: MaybeValueFnWithParams<string, { actionParams: PlainObject }>

  /**
   * Return additional axios config
   */
  fetchConfig?: () => AxiosRequestConfig

  /**
   * Transform response data into `TFromData`
   */
  transformFetchResponse?: (response: any) => TFromData

  /**
   * `url` used to submit form data
   */
  submitUrl?: MaybeValueFnWithParams<
    string,
    { actionParams: PlainObject; data: TFromData; isEdit: boolean }
  >

  /**
   * Return additional axios config
   *
   * @example ```ts
   *   // override request method
   *   submitConfig: () => ({ method: 'POST' })
   * ```
   */
  submitConfig?: () => AxiosRequestConfig

  /**
   * Transform formData before submit
   */
  transformFormDataToRequestData?: (
    data: TFromData,
    initialParams: TInitialParams
  ) => any

  preAction?: () => void

  // postAction?: () => void

  postSubmit?: (response: any) => void
}

export type UseEditStoreReturn<TFormData, TInitialParams> = {
  data: Ref<TFormData>
  isEdit: Ref<boolean>
  loading: Ref<boolean>
  saving: Ref<boolean>
  initialParams: Ref<TInitialParams>
  actionParams: Ref<PlainObject>
  actions: {
    setInitialParams: (params: TInitialParams) => void
    onAdd: (params?: PlainObject) => void
    onEdit: (params: PlainObject) => void
    onSubmit: () => void
    onReset: () => void
  }
}

export const EditStoreInjectionKey = Symbol(
  'EditStoreInjection'
) as InjectionKey<UseEditStoreReturn<any, any>>

export function useEditStore<
  TFromData extends PlainObject,
  TInitialParams extends PlainObject
>(
  options: EditStoreOptions<TFromData, TInitialParams>
): UseEditStoreReturn<TFromData, TInitialParams> {
  const { requestService: request } = ConfigProvider.config

  const initialParams = ref({}) as Ref<TInitialParams>

  const actionParams = ref({}) as Ref<PlainObject>

  const data = ref({}) as Ref<TFromData>

  const isEdit = ref(false)

  const loading = ref(false)

  const saving = ref(false)

  const submitResponse = ref<any>()

  const abortControllerForSubmit = ref<AbortController>()

  function preAction() {
    saving.value = false
    data.value = {} as TFromData
    options.preAction?.()
  }

  /**
   * Initialize add form
   *
   * @param options.actionParams
   */
  async function onAdd(params?: PlainObject) {
    preAction()
    try {
      isEdit.value = false
      loading.value = true
      actionParams.value = params ?? {}
      data.value = await getDefaultFormData()
    } catch (error) {
      // TODO: handle error
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize edit form
   *
   * @param options.actionParams
   */
  async function onEdit(params: PlainObject) {
    preAction()
    try {
      isEdit.value = true
      loading.value = true
      actionParams.value = params ?? {}
      data.value = await fetchFormData()
    } catch (error) {
      // TODO: handle error
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  function preSubmit() {
    // Abort previous submit
    if (abortControllerForSubmit.value) {
      abortControllerForSubmit.value.abort()
    }
    abortControllerForSubmit.value = new AbortController()

    submitResponse.value = undefined
  }

  async function onSubmit() {
    if (!options.submitUrl) {
      throw new Error('submitUrl is required')
    }

    preSubmit()
    try {
      saving.value = true
      const url = resolveValue(options.submitUrl, {
        actionParams: actionParams.value,
        data: data.value,
        isEdit: isEdit.value
      })

      const _data = options.transformFormDataToRequestData
        ? options.transformFormDataToRequestData(
            data.value,
            initialParams.value
          )
        : data.value

      const defaultConfig: AxiosRequestConfig = {
        url,
        method: isEdit.value ? 'PUT' : 'POST',
        data: _data,
        signal: abortControllerForSubmit.value?.signal
      }

      submitResponse.value = await request.request({
        ...defaultConfig,
        ...options.submitConfig?.()
      })
    } catch (error) {
      // TODO handle error
      console.error(error)
    } finally {
      saving.value = false
      options.postSubmit?.(submitResponse.value)
    }
  }

  async function onReset() {
    loading.value = true
    data.value = await (isEdit.value ? fetchFormData() : getDefaultFormData())
    loading.value = false
  }

  async function getDefaultFormData(): Promise<TFromData> {
    if (options.defaultFormData) {
      return await resolveAsyncValue(options.defaultFormData, {
        initialParams: initialParams.value,
        actionParams: actionParams.value
      })
    }
    return {} as any
  }

  /**
   * If `fetchUrl` is provided, fetch form data from server
   *
   * Otherwise, return `actionParams` as formData
   */
  async function fetchFormData(): Promise<TFromData> {
    if (options.fetchUrl) {
      const url = resolveValue(options.fetchUrl, {
        actionParams: actionParams.value
      })
      const response = await request.get(url, options.fetchConfig?.())
      return options.transformFetchResponse
        ? options.transformFetchResponse(response)
        : (response as TFromData)
    }
    return cloneDeep(actionParams.value) as TFromData
  }

  function setInitialParams(params: TInitialParams) {
    initialParams.value = params
  }

  const store = {
    data,
    isEdit,
    loading,
    saving,
    initialParams,
    actionParams,
    actions: {
      setInitialParams,
      onAdd,
      onEdit,
      onSubmit,
      onReset
    },
    __injectionKey: EditStoreInjectionKey
  }

  function setup() {
    if (options.initialParams) {
      initialParams.value = resolveValue(options.initialParams, null)
    }
  }

  setup()

  return store
}
