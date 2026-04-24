import * as React from 'react'
import { domain } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

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

export default function NotionDomainPage(props) {
  return <NotionPage {...props} />
}
