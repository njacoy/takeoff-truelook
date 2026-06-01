const required = (name: string, value: string | undefined, fallback: string): string => {
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === 'production') {
    console.warn(`[site.config] ${name} is not set — falling back to "${fallback}".`);
  }
  return fallback;
};

const rawUrl = required(
  'NEXT_PUBLIC_SITE_URL',
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
);

const siteUrl = rawUrl.replace(/\/+$/, '');

export const siteConfig = {
  url: siteUrl,
  name: required('NEXT_PUBLIC_SITE_NAME', process.env.NEXT_PUBLIC_SITE_NAME, 'Site Name'),
  description: required(
    'NEXT_PUBLIC_SITE_DESCRIPTION',
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    'A landing page built with the website-starter-kit.',
  ),
  ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/og.png',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
} as const;

export type SiteConfig = typeof siteConfig;

export const absoluteUrl = (path = '/'): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${p}`;
};
