import * as React from 'react'

import { PageProps, Params } from 'lib/types'
import { domain, isDev } from 'lib/config'

import { GetStaticProps } from 'next'
import { NotionPage } from 'components'
import { getSiteMap } from 'lib/get-site-map'
import { resolveNotionPage } from 'lib/resolve-notion-page'

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // Return an error state so the build doesn't fail on rate limiting or
    // transient Notion API errors. ISR will regenerate on the next request.
    return {
      props: {
        error: { statusCode: 500, message: (err as Error).message }
      },
      revalidate: 1
    }
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: true
  }

  return staticPaths
}

export default function NotionDomainDynamicPage(props) {

  return <NotionPage {...props} />
}
