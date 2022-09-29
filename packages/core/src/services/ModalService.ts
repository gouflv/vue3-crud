export class ModalService {
  alert(options: {
    title: string
    content?: string
    type?: 'success' | 'info' | 'warning' | 'error'
    onOk?: () => void
  }) {
    window.alert(options.title)
    options.onOk?.()
  }
  confirm(options: {
    title: string
    content?: string
    type?: 'success' | 'info' | 'warning' | 'error'
    onOk?: () => void
    onCancel?: () => void
  }) {
    if (window.confirm(options.title)) {
      options.onOk?.()
    } else {
      options.onCancel?.()
    }
  }
}
