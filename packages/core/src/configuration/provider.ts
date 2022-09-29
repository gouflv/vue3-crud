import { MessageService, ModalService, RequestService } from '../services'

type Config = {
  requestService: RequestService
  modalService: ModalService
  messageService: MessageService
}

const defaults: Config = {
  requestService: new RequestService(),
  modalService: new ModalService(),
  messageService: new MessageService()
}

/**
 * Application configuration provider
 */
export const ConfigProvider = {
  config: defaults,
  set(config: Partial<Config>) {
    this.config = { ...defaults, ...config }
  }
}
