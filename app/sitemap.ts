import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
