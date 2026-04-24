import { ExtendedRecordMap, SearchParams, SearchResults } from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'

import { notion } from './notion-api'
import { getPreviewImageMap } from './preview-images'
import {
  isPreviewImageSupportEnabled,
  navigationStyle,
  navigationLinks
} from './config'

let navigationLinkPagesPromise: Promise<ExtendedRecordMap[]> | null = null

function getNavigationLinkPages(): Promise<ExtendedRecordMap[]> {
  if (!navigationLinkPagesPromise) {
    navigationLinkPagesPromise = fetchNavigationLinkPages()
  }
  return navigationLinkPagesPromise
}

async function fetchNavigationLinkPages(): Promise<ExtendedRecordMap[]> {
  const navigationLinkPageIds = (navigationLinks || [])
    .map((link) => link.pageId)
    .filter(Boolean)

  if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
    return Promise.all(
      navigationLinkPageIds.map((navigationLinkPageId) =>
        notion.getPage(navigationLinkPageId, {
          chunkLimit: 1,
          fetchMissingBlocks: false,
          fetchCollections: false,
          signFileUrls: false
        })
      )
    )
  }

  return []
}

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  let recordMap = await notion.getPage(pageId)

  if (navigationStyle !== 'default') {
    const navigationLinkRecordMaps = await getNavigationLinkPages()

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      )
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap)
    ;(recordMap as any).preview_images = previewImageMap
  }

  return recordMap
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
