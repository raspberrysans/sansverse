import * as React from 'react'
import { ImageResponse } from 'next/og'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

import {
  getBlockTitle,
  getBlockIcon,
  getPageProperty,
  isUrl,
  parsePageId
} from 'notion-utils'
import { Block, PageBlock } from 'notion-types'

import { notion } from 'lib/notion-api'
import { mapImageUrl } from 'lib/map-image-url'
import { interRegular } from 'lib/fonts'
import * as config from 'lib/config'

const W = 1200
const H = 630
const PAD = 50
const AUTHOR_IMG = 72

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pageId = parsePageId(req.query.id as string)
  if (!pageId) return res.status(400).send('Invalid notion page id')

  const recordMap = await notion.getPage(pageId)
  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value as Block
  if (!block) return res.status(400).send('Invalid recordMap for page')

  const isBlogPost =
    block.type === 'page' && block.parent_table === 'collection'
  const title = getBlockTitle(block, recordMap) || config.name
  const image = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      config.defaultPageCover,
    block
  )

  const coverPosition =
    (block as PageBlock).format?.page_cover_position ??
    config.defaultPageCoverPosition
  const objectPosition = coverPosition
    ? `center ${(1 - coverPosition) * 100}%`
    : 'center center'

  const blockIcon = getBlockIcon(block, recordMap)
  const authorImage = mapImageUrl(
    blockIcon && isUrl(blockIcon) ? blockIcon : config.defaultPageIcon,
    block
  )

  const author =
    getPageProperty<string>('Author', block, recordMap) || config.author

  const lastUpdatedTime = getPageProperty<number>(
    'Last Updated',
    block,
    recordMap
  )
  const publishedTime = getPageProperty<number>('Published', block, recordMap)
  const dateUpdated = lastUpdatedTime
    ? new Date(lastUpdatedTime)
    : publishedTime
    ? new Date(publishedTime)
    : undefined
  const date =
    isBlogPost && dateUpdated
      ? `${dateUpdated.toLocaleString('en-US', {
          month: 'long'
        })} ${dateUpdated.getFullYear()}`
      : undefined
  const detail = date || config.domain

  const fontData = Buffer.from(interRegular, 'base64').buffer

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: PAD,
          backgroundColor: '#1F2027',
          color: '#fff',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: PAD,
            width: '100%',
            height: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1
            }}
          >
            <div
              style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}
            >
              <h1
                style={{
                  fontSize: 48,
                  lineHeight: 1.3,
                  margin: 0,
                  color: '#fff',
                  fontWeight: 'normal'
                }}
              >
                {title}
              </h1>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 24,
                color: '#A9ACC0',
                fontSize: 22
              }}
            >
              {authorImage && (
                <img
                  src={authorImage}
                  width={AUTHOR_IMG}
                  height={AUTHOR_IMG}
                  style={{
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    objectFit: 'cover'
                  }}
                />
              )}

              {(author || detail) && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {author && (
                    <div style={{ fontSize: 28, color: '#A9ACC0' }}>
                      {author}
                    </div>
                  )}
                  {detail && (
                    <div style={{ color: '#A9ACC0' }}>{detail}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {image && (
            <img
              src={image}
              style={{
                width: Math.round((W - PAD * 3) * 0.35),
                height: H - PAD * 2,
                borderRadius: 4,
                objectFit: 'cover',
                objectPosition
              }}
            />
          )}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 400,
          style: 'normal'
        }
      ]
    }
  )

  const pngBuffer = Buffer.from(await imageResponse.arrayBuffer())
  const jpegBuffer = await sharp(pngBuffer).jpeg({ quality: 75 }).toBuffer()

  res.setHeader(
    'Cache-Control',
    'max-age=0, s-maxage=86400, stale-while-revalidate=3600'
  )
  res.setHeader('Content-Type', 'image/jpeg')
  res.send(jpegBuffer)
}
