import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: 'ec6f013522a4404f86bd4f806cd88648',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: null,

  // basic site info (required)
  name: 'sansverse by sans',
  domain: 'sansverse.co',
  author: 'Sans Bhatia',

  // open graph metadata (optional)
  description: 'sans personal website/portfolio',

  // social usernames (optional)
  // twitter: 'transitive_bs',
  github: 'raspberrysans',
  linkedin: 'sans-bhatia-41818a212',
  newsletter: 'https://medium.com/@sansverse', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: 'https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2FILLO_Diamond_L_Solo.gif?v=1618852786776',
  defaultPageCover: 'https://images.prismic.io/glitch-cms/e5e2a334-2a04-4269-ba4f-f12feda68871_Screen+Shot+2022-06-02+at+4.45.47+PM.png',
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  pageUrlOverrides: {
    '/blog': '84eebaf5abbb4c47b27649d3e916d66c',
    // '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  },
  // pageUrlOverrides: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages
  navigationStyle: 'default'
  // navigationStyle: 'custom',
  // navigationLinks: [
  //   {
  //     title: 'About',
  //     pageId: 'f1199d37579b41cbabfc0b5174f4256a'
  //   },
  //   {
  //     title: 'Contact',
  //     pageId: '6a29ebcb935a4f0689fe661ab5f3b8d1'
  //   }
  // ]
})
