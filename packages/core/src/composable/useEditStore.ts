import { AxiosRequestConfig } from 'axios'
import { Ref, ref } from 'vue'
import { ConfigProvider } from '../configuration/provider'
import {
  MaybePromiseFnWithParams,
  MaybeValueFn,
  MaybeValueFnWithParams,
  PlainObject
} from '../types'
import { resolveAsyncValue, resolveValue } from '../utils'

type EditStoreOptions<TFromData, TInitialParams> = {
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
    { initialParams?: TInitialParams; actionParams?: any }
  >

  /**
   * `url` used to fetch form data
   */
  fetchUrl?: MaybeValueFnWithParams<string, { actionParams?: PlainObject }>

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
  submitUrl: MaybeValueFnWithParams<
    string,
    { actionParams?: PlainObject; data: TFromData }
  >

  /**
   * Return additional axios config
   *
   * @example ```ts
   *   // override submit method
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

  postAction?: (response: any) => void
}

export function useEditStore<
  TFromData extends PlainObject,
  TInitialParams extends PlainObject
>(options: EditStoreOptions<TFromData, TInitialParams>) {
  const { requestService: request } = ConfigProvider.config

  const initialParams = ref({}) as Ref<TInitialParams>

  const actionParams = ref({}) as Ref<PlainObject>

  const data = ref({}) as Ref<TFromData>

  const isEdit = ref(false)

  const loading = ref(false)

  const saving = ref(false)

  const submitResponse = ref<any>()

  /**
   * Initialize add form
   *
   * @param options.actionParams
   */
  async function onAdd(action?: { actionParams?: PlainObject }) {
    options.preAction?.()
    try {
      isEdit.value = false
      loading.value = true
      if (action?.actionParams) actionParams.value = action.actionParams
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
  async function onEdit(action: { actionParams?: PlainObject }) {
    options.preAction?.()
    try {
      isEdit.value = true
      loading.value = true
      if (action?.actionParams) actionParams.value = action.actionParams
      data.value = await fetchFormData()
    } catch (error) {
      // TODO: handle error
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function onSubmit() {
    saving.value = true
    const url = resolveValue(options.submitUrl, {
      actionParams: actionParams.value,
      data: data.value
    })
    submitResponse.value = await request.post(
      url,
      options.transformFormDataToRequestData
        ? options.transformFormDataToRequestData(
            data.value,
            initialParams.value
          )
        : data.value,
      options.submitConfig?.()
    )
    saving.value = false
    options.postAction?.(submitResponse.value)
  }

  async function onReset() {
    data.value = await (isEdit.value ? fetchFormData() : getDefaultFormData())
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
    return actionParams.value as TFromData
  }

  function setInitialParams(params: TInitialParams) {
    initialParams.value = params
  }

  const store = {
    data,
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
    }
  }

  function setup() {
    if (options.initialParams) {
      initialParams.value = resolveValue(options.initialParams, null)
    }
  }

  setup()

  return store
}

export type UseEditStoreReturn = ReturnType<typeof useEditStore>
