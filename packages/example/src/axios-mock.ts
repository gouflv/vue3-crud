import { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'

export let axiosMock: MockAdapter | null = null

export const mockAxios = (axios: AxiosInstance) => {
  axiosMock = new MockAdapter(axios, {
    delayResponse: 500,
    onNoMatch: 'passthrough'
  })

  let id = 1
  axiosMock.onGet('/api/mock/users').reply(() => [
    200,
    {
      code: 0,
      data: {
        items: [
          {
            id: id++,
            name: 'John Brown',
            age: 32
          },
          {
            id: id++,
            name: 'Jim Green',
            age: 42
          }
        ],
        page: 0,
        size: 20,
        total: 21
      }
    }
  ])

  axiosMock.onGet(/\/api\/mock\/users\/\d+/).reply(() => [
    200,
    {
      code: 0,
      data: {
        id: 1,
        name: 'John Brown',
        age: 2
      }
    }
  ])

  axiosMock.onPost('/api/mock/users').reply(() => [
    200,
    {
      code: 0,
      data: {}
    }
  ])

  axiosMock.onPut(/\/api\/mock\/users\/\d+/).reply(() => [
    200,
    {
      code: 0,
      data: {}
    }
  ])

  axiosMock.onDelete(/\/api\/mock\/users\/\d+/).reply(() => [
    200,
    {
      code: 0,
      data: {}
    }
  ])
}
