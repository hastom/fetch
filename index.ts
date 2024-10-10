export type ExtendedRequestInit = Omit<RequestInit, 'body'> & {
  body?: RequestInit['body'] | Record<string, unknown>,
  params?: Record<string, unknown>,
  baseURL?: string,
}

export type Fetch = (input: RequestInfo | URL, init?: ExtendedRequestInit) => Promise<Response>

export type Fetcher = Fetch & {
  get: Fetch,
  post: Fetch,
  put: Fetch,
  patch: Fetch,
  delete: Fetch,
}

function isAnyObject(a: unknown): a is Record<string, unknown> {
  return typeof a === 'object'
}

function isPlainObject(a: unknown): a is Record<string, unknown> {
  return typeof a === 'object' && a !== null && a.constructor === Object
}

const absoluteURLRegex = /^([a-z][a-z\d+\-.]*:)?\/\//i

function isAbsoluteURL(url: string) {
  return absoluteURLRegex.test(url)
}

function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL
}

function mergeDeep(target: Record<string, unknown>, source?: Record<string, unknown>) {

  if (!source) {
    return target
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue)
    } else if (isAnyObject(targetValue) && isAnyObject(sourceValue)) {
      target[key] = mergeDeep({ ...targetValue }, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}

export function stringifyParams(params: Record<string, unknown>, prefix = '') {
  const str: string[] = []
  for (const p in params) {
    if (params.hasOwnProperty(p)) {
      const key = prefix ? prefix + '[' + p + ']' : p
      const value = params[p]
      if (value === undefined) {
        continue
      }
      str.push((value !== null && isAnyObject(value))
        ? stringifyParams(value, key)
        : encodeURIComponent(key) + '=' + encodeURIComponent(value as string))
    }
  }
  return str.filter((p) => !!p).join('&')
}

function convertInputToURL(input: RequestInfo | URL, init: ExtendedRequestInit = {}): URL {
  if (typeof input === 'string') {
    if (isAbsoluteURL(input)) {
      return new URL(input)
    } else {
      if (init.baseURL) {
        if (isAbsoluteURL(init.baseURL)) {
          return new URL(combineURLs(init.baseURL, input))
        } else if (typeof location !== 'undefined') {
          return new URL(combineURLs(init.baseURL, input), location.origin)
        } else {
          throw new Error(
            `Failed to build URL: base url is relative (${init.baseURL}) and browser location is unavailable`,
          )
        }
      } else {
        if (typeof location !== 'undefined') {
          return new URL(input, location.origin)
        } else {
          throw new Error('Failed to build URL: base url is not set and browser location is unavailable')
        }
      }
    }
  }
  if (input instanceof Request) {
    return new URL(input.url)
  }
  return input
}

function transformOptions(input: RequestInfo | URL, init: ExtendedRequestInit = {}) {

  const { body, headers, params, baseURL, ...rest } = init
  const url = convertInputToURL(input, init)
  const normilizedHeaders = headers instanceof Headers ? headers : new Headers(headers)
  const options: RequestInit = rest

  if (body) {
    if (isPlainObject(body)) {
      options.body = JSON.stringify(body)
      normilizedHeaders.set('content-type', 'application/json')
    } else {
      options.body = body
    }
  }

  if (params) {
    const paramsString = stringifyParams(params)
    if (paramsString) {
      url.search += '&' + paramsString
    }
  }

  options.headers = normilizedHeaders

  return [url, options] as const
}

function request(input: RequestInfo | URL, init?: ExtendedRequestInit): Promise<Response> {
  const [url, options] = transformOptions(input, init)
  return fetch(url, options)
}

export function createFetchInstance(defaultInit: ExtendedRequestInit = {}): Fetcher {
  function extendedFetchInstance(input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init }))
  }

  extendedFetchInstance.get = function (input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init, method: 'GET' }))
  }
  extendedFetchInstance.post = function (input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init, method: 'POST' }))
  }
  extendedFetchInstance.put = function (input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init, method: 'PUT' }))
  }
  extendedFetchInstance.patch = function (input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init, method: 'PATCH' }))
  }
  extendedFetchInstance.delete = function (input: RequestInfo | URL, init?: ExtendedRequestInit) {
    return request(input, mergeDeep({ ...defaultInit }, { ...init, method: 'DELETE' }))
  }
  return extendedFetchInstance
}

export const fetcher = createFetchInstance()
