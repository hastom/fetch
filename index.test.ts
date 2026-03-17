import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFetchInstance } from './index'

const fetchSpy = vi.fn((_input: URL, _init?: RequestInit) => Promise.resolve(new Response()))

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSpy)
  fetchSpy.mockClear()
})

function requestedURL() {
  return fetchSpy.mock.calls[0][0].href
}

describe('trimTrailingSlash', () => {
  it('keeps trailing slash by default', async () => {
    const api = createFetchInstance()
    await api.get('https://example.com/users/')

    expect(requestedURL()).toBe('https://example.com/users/')
  })

  it('keeps trailing slash when option is false', async () => {
    const api = createFetchInstance({ trimTrailingSlash: false })
    await api.get('https://example.com/users/')

    expect(requestedURL()).toBe('https://example.com/users/')
  })

  it('trims trailing slash when option is true', async () => {
    const api = createFetchInstance({ trimTrailingSlash: true })
    await api.get('https://example.com/users/')

    expect(requestedURL()).toBe('https://example.com/users')
  })

  it('trims multiple trailing slashes', async () => {
    const api = createFetchInstance({ trimTrailingSlash: true })
    await api.get('https://example.com/users///')

    expect(requestedURL()).toBe('https://example.com/users')
  })

  it('preserves root slash for domain-only URL', async () => {
    const api = createFetchInstance({ trimTrailingSlash: true })
    await api.get('https://example.com/')

    expect(requestedURL()).toBe('https://example.com/')
  })

  it('per-request option overrides instance default', async () => {
    const api = createFetchInstance({ trimTrailingSlash: false })
    await api.get('https://example.com/users/', { trimTrailingSlash: true })

    expect(requestedURL()).toBe('https://example.com/users')
  })

  it('keeps trailing slash on path with query params when option is off', async () => {
    const api = createFetchInstance()
    await api.get('https://example.com/users/?active=true')

    expect(requestedURL()).toBe('https://example.com/users/?active=true')
  })

  it('trims trailing slash on path with query params', async () => {
    const api = createFetchInstance({ trimTrailingSlash: true })
    await api.get('https://example.com/users/?active=true')

    expect(requestedURL()).toBe('https://example.com/users?active=true')
  })

  describe('with baseURL', () => {
    it('keeps trailing slash from combined URL by default', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api' })
      await api.get('/users/')

      expect(requestedURL()).toBe('https://example.com/api/users/')
    })

    it('trims trailing slash from combined URL when option is true', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api', trimTrailingSlash: true })
      await api.get('/users/')

      expect(requestedURL()).toBe('https://example.com/api/users')
    })

    it('keeps trailing slash on baseURL-only request by default', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api/' })
      await api.get('')

      expect(requestedURL()).toBe('https://example.com/api/')
    })

    it('trims trailing slash on baseURL-only request when option is true', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api/', trimTrailingSlash: true })
      await api.get('')

      expect(requestedURL()).toBe('https://example.com/api')
    })

    it('per-request trim overrides instance default with baseURL', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api' })
      await api.get('/users/', { trimTrailingSlash: true })

      expect(requestedURL()).toBe('https://example.com/api/users')
    })

    it('trims trailing slash from combined URL with query params', async () => {
      const api = createFetchInstance({ baseURL: 'https://example.com/api', trimTrailingSlash: true })
      await api.get('/users/?active=true')

      expect(requestedURL()).toBe('https://example.com/api/users?active=true')
    })
  })
})
