import ExpiryMap from 'expiry-map'

import { api } from './config'
import * as types from './types'

const cache = new ExpiryMap<string, Promise<types.SearchResults>>(10000)

export function searchNotion(
  params: types.SearchParams
): Promise<types.SearchResults> {
  const key = params?.query ?? ''
  if (cache.has(key)) return cache.get(key)!
  const p = searchNotionImpl(params)
  cache.set(key, p)
  return p
}

async function searchNotionImpl(
  params: types.SearchParams
): Promise<types.SearchResults> {
  const response = await fetch(api.searchNotion, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'content-type': 'application/json'
    }
  })

  if (response.ok) {
    return response.json()
  }

  const error: any = new Error(response.statusText)
  error.response = response
  throw error
}
