// global styles shared across the entire site
import 'styles/global.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'
// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// global style overrides for notion
import 'styles/notion.css'
// global style overrides for prism theme (optional)
import 'styles/prism-theme.css'

import * as Fathom from 'fathom-client'
import * as React from 'react'

import {
  fathomConfig,
  fathomId,
  posthogConfig,
  posthogId
} from 'lib/config'

import type { AppProps } from 'next/app'
import posthog from 'posthog-js'
import { useRouter } from 'next/router'

// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'





// if (!isServer) {
//   bootstrap()
// }

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  React.useEffect(() => {
    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview()
      }

      if (posthogId) {
        posthog.capture('$pageview')
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig)
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return <Component {...pageProps} />
}
