import { BRAND_IMAGE, OG_DESCRIPTION, OG_URL } from './src/constants';

const config = {
  defaultTitle: 'Proof of Mission Protocol ',
  additionalLinkTags: [
    {
      rel: 'icon',
      href: `${OG_URL}/logo/madseed-logo.svg`
    },
    {
      rel: 'apple-touch-icon',
      href: `${OG_URL}/logo/icon-192x192.png`,
      sizes: '192x192'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    }
  ],
  openGraph: {
    type: 'website',
    url: OG_URL,
    locale: 'en_IE',
    site_name: 'Proof of mission protocol',
    description: OG_DESCRIPTION,
    images: [
      {
        type: 'image/png',
        url: BRAND_IMAGE,
        alt: 'pomp',
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    domain: OG_URL,
    url: OG_URL,
    desciption: OG_DESCRIPTION,
    images: [
      {
        type: 'image/jpg',
        url: BRAND_IMAGE,
        alt: 'pomp'
      }
    ],
    handle: '@madseedxyz',
    site: '@madseedxyz',
    cardType: 'summary_large_image'
  }
};

export default config;
