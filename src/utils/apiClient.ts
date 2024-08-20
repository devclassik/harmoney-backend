import { create } from 'apisauce'

export const apiClient = (baseURL: string, headers: any = {}) => {
  const proxy = create({
    baseURL,
    headers: {
      crossOriginIsolated: true,
      ...headers
    },
  })

  proxy.addAsyncRequestTransform(async (request) => {
    // console.log(
    //   `REQUEST: ${request.baseURL}${request.url}`,
    //   JSON.stringify(request.data, undefined, 3),
    // )

    // if (authToken) {
    //   console.log('tookkkeenn: ', authToken);

    //   if (request.headers)
    //     request.headers["authorization"] = `Bearer ${authToken}`;
    // }
  })

  proxy.addAsyncResponseTransform(async (response) => {
    // console.log(
    //   `RESPONSE: ${response.config?.baseURL}${response.config?.url}`,
    //   JSON.stringify(response.data, undefined, 3),
    // )
  })

  return proxy
}
