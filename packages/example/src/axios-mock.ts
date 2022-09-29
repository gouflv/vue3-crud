import { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'

export let axiosMock: MockAdapter | null = null

export const mockAxios = (axios: AxiosInstance) => {
  axiosMock = new MockAdapter(axios, {
    delayResponse: 500,
    onNoMatch: 'passthrough'
  })

  axiosMock.onGet('/api/mock/users').reply(200, {
    code: 0,
    data: {
      items: [
        {
          id: 1,
          name: 'John Brown',
          age: 32
        },
        {
          id: 2,
          name: 'Jim Green',
          age: 42
        }
      ],
      page: 0,
      size: 20,
      total: 21
    }
  })
}
