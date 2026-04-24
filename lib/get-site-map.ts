import * as config from './config'
import * as types from './types'

import { getAllPagesInSpace } from 'notion-utils'
import { getCanonicalPageId } from './get-canonical-page-id'
import { includeNotionIdInUrls } from './config'
import { notion } from './notion-api'

const uuid = !!includeNotionIdInUrls

export async function getSiteMap(): Promise<types.SiteMap> {
  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId
  )

  return {
    site: config.site,
    ...partialSiteMap
  } as types.SiteMap
}

const getAllPagesCache = new Map<string, Promise<Partial<types.SiteMap>>>()

function getAllPages(
  rootNotionPageId: string,
  rootNotionSpaceId: string
): Promise<Partial<types.SiteMap>> {
  const key = JSON.stringify([rootNotionPageId, rootNotionSpaceId])
  if (!getAllPagesCache.has(key)) {
    getAllPagesCache.set(key, getAllPagesImpl(rootNotionPageId, rootNotionSpaceId))
  }
  return getAllPagesCache.get(key)!
}

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId: string
): Promise<Partial<types.SiteMap>> {
  const getPage = async (pageId: string, ...args) => {
    return notion.getPage(pageId, ...args)
  }

  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    getPage
  )

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (map, pageId: string) => {
      const recordMap = pageMap[pageId]
      if (!recordMap) {
        console.warn(`skipping page "${pageId}" — failed to load`)
        return map
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid
      })

      if (map[canonicalPageId]) {
        console.warn('duplicate canonical page id', {
          canonicalPageId,
          pageId,
          existingPageId: map[canonicalPageId]
        })

        return map
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId
        }
      }
    },
    {}
  )

  return {
    pageMap,
    canonicalPageMap
  }
}
