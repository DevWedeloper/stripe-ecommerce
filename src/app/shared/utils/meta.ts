export const metaWith = (title: string, description: string) => [
  {
    name: 'description',
    content: description,
  },
  {
    name: 'author',
    content: 'DevWedeloper',
  },
  {
    property: 'og:title',
    content: title,
  },
  {
    property: 'og:site_name',
    content: 'Stripe Ecommerce',
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    property: 'og:url',
    // TODO: Change to actual url
    content: 'https://stripe-ecommerce-devwedeloper.vercel.app/',
  },
  {
    property: 'og:description',
    content: description,
  },
  {
    property: 'og:image',
    // TODO: Change to actual url
    content: 'https://stripe-ecommerce-devwedeloper.vercel.app/favicon.ico',
  },
  {
    property: 'twitter:card',
    content: 'summary_large_image',
  },
  {
    property: 'twitter:title',
    content: title,
  },
  {
    property: 'twitter:description',
    content: description,
  },
  {
    property: 'twitter:image',
    content: 'https://stripe-ecommerce-devwedeloper.vercel.app/favicon.ico',
  },
];
