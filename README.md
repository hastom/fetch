# A little sugar to Fetch API

Axios-like request methods:

```ts
import { fetcher } from '@hastom/fetch'

await fetcher.get('https://google.com')
```

Auto-stringify get-params:

```ts
import { fetcher } from '@hastom/fetch'

await fetcher('https://google.com', {
  params: {
    query: 'string',
    and: ['also', 'arrays']
  }
})
```

Auto-strigify body to json and set content-type to application/json:

```ts
import { fetcher } from '@hastom/fetch'

await fetcher.post('https://google.com', {
  body: {
    query: 'string',
    and: ['also', 'arrays']
  }
})
```

Create instances with default params:

```ts
import { createFetchInstance } from '@hastom/fetch'

const authorizedFetch = createFetchInstance({
  headers: {
    Authorization: 'Bearer ...',
  },
})

await authorizedFetch.get('https://my-api.com/private-data')

```

and set base url:

```ts
import { createFetchInstance } from '@hastom/fetch'

const myApi = createFetchInstance({
  baseURL: 'https://my-api.com',
})

await myApi.get('/important-data')
```
