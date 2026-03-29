import { Block } from 'notion-types'
import { defaultMapImageUrl as defaultMapImageUrlImpl } from 'notion-utils'

import { defaultPageIcon, defaultPageCover } from './config'

export const mapImageUrl = (url: string, block: Block) => {
  if (!url || url === defaultPageCover || url === defaultPageIcon) {
    return url
  }

  return defaultMapImageUrlImpl(url, block)
}
