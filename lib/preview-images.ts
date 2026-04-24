import { ExtendedRecordMap, PreviewImage, PreviewImageMap } from 'notion-types'
import { defaultPageCover, defaultPageIcon } from './config'
import { getPageImageUrls, normalizeUrl } from 'notion-utils'
import { db } from './db'
import lqip from 'lqip-modern'
import { mapImageUrl } from './map-image-url'

async function pMap<T, R>(
  iterable: T[],
  mapper: (item: T) => Promise<R>,
  { concurrency }: { concurrency: number }
): Promise<R[]> {
  const results: R[] = []
  const items = [...iterable]
  let index = 0
  async function worker() {
    while (index < items.length) {
      const i = index++
      results[i] = await mapper(items[i])
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  )
  return results
}

const memoCache = new Map<string, Promise<PreviewImage | null>>()

function pMemoize(
  fn: (url: string, opts: { cacheKey: string }) => Promise<PreviewImage | null>
) {
  return (
    url: string,
    opts: { cacheKey: string }
  ): Promise<PreviewImage | null> => {
    const key = opts.cacheKey
    if (memoCache.has(key)) return memoCache.get(key)!
    const p = fn(url, opts)
    memoCache.set(key, p)
    return p
  }
}

export async function getPreviewImageMap(
  recordMap: ExtendedRecordMap
): Promise<PreviewImageMap> {
  const urls: string[] = getPageImageUrls(recordMap, {
    mapImageUrl
  })
    .concat([defaultPageIcon, defaultPageCover])
    .filter(Boolean)

  const previewImagesMap = Object.fromEntries(
    await pMap(
      urls,
      async (url) => {
        const cacheKey = normalizeUrl(url)
        return [cacheKey, await getPreviewImage(url, { cacheKey })]
      },
      { concurrency: 8 }
    )
  )

  return previewImagesMap
}

async function createPreviewImage(
  url: string,
  { cacheKey }: { cacheKey: string }
): Promise<PreviewImage | null> {
  try {
    try {
      const cachedPreviewImage = await db.get(cacheKey)
      if (cachedPreviewImage) {
        return cachedPreviewImage
      }
    } catch (err) {
      console.warn(`redis error get "${cacheKey}"`, (err as Error).message)
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`)
    }
    const body = Buffer.from(await response.arrayBuffer())
    const result = await lqip(body)

    const previewImage = {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64
    }

    try {
      await db.set(cacheKey, previewImage)
    } catch (err) {
      console.warn(`redis error set "${cacheKey}"`, (err as Error).message)
    }

    return previewImage
  } catch (err) {
    console.warn('failed to create preview image', url, (err as Error).message)
    return null
  }
}

export const getPreviewImage = pMemoize(createPreviewImage)
