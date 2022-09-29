export class MessageService {
  duration = 3

  open(options: {
    content: string
    type?: 'loading' | 'success' | 'info' | 'warning' | 'error'
    duration?: number
  }) {
    console.log(options.content)
  }
}
