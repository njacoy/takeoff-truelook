import { siteConfig, absoluteUrl } from '@/site.config';

export const dynamic = 'force-static';

export function GET() {
  const body = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    '## Primary',
    `- [Home](${absoluteUrl('/')})`,
    '',
    '## Discovery',
    `- [Sitemap](${absoluteUrl('/sitemap.xml')})`,
    `- [Robots](${absoluteUrl('/robots.txt')})`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
